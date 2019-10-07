// @flow
require('dotenv').config();
const Airtable = require('airtable');
const moment = require('moment');
const { respond, Invoke } = require('serverless-helpers');

declare class process {
  static env: {
    stage: string,
    airtableKey: string,
    airtableBase: string,
  };
}

class GameStatus {
  started: boolean;
  ended: boolean;
  blowout: boolean;
  description: string;
}

module.exports.health = async (event: any) => {
  return respond(200, `hello`);
};

module.exports.controlCenterDailyInit = async (event: any) => {
  const regions = ['Cincinnati'];
  const invoke = new Invoke();
  const { data: locations } = await invoke
    .service('location')
    .name('controlCenterLocationsByRegion')
    .pathParams({ regions })
    .headers(event.headers)
    .go();
  for (location of locations) {
    const boxes = location.boxes.filter(b => b.zone).sort((a, b) => a.zone - b.zone);
    let i = 0;
    for (const box of boxes) {
      const command = 'tune';
      const reservation = {
        location,
        box,
        program: {
          channel: getChannelForZone(i),
        },
      };
      const source = 'control center daily';
      const invoke = new Invoke();
      await invoke
        .service('remote')
        .name('command')
        .body({ reservation, command, source })
        .async()
        .go();
      i++;
    }
  }
  return respond(200);
};

module.exports.updateGameStatus = async (event: any) => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  console.log('searching for games to change');
  // TODO shouldnt be all games
  try {
    let allGames = await base('Games')
      .select({
        view: 'Score Update',
      })
      .eachPage(async (allGames, fetchNextPage) => {
        console.log('allGames', allGames.length);
        if (allGames.length) {
          for (const game of allGames) {
            console.log({ game });
            const siWebUrl: string = game.get('Scores Link');
            const gameOver: boolean = game.get('Game Over');
            const blowout: boolean = game.get('Blowout');
            const gameId: string = game.id;
            const invoke = new Invoke();
            const { data } = await invoke
              .service('game')
              .name('getStatus')
              .body({ url: siWebUrl })
              .headers(event.headers)
              .go();
            console.log({ data });
            const gameStatus: GameStatus = data;
            console.log({ gameStatus });
            await base('Games').update(gameId, {
              'Game Status': gameStatus.description,
              'Game Over': gameStatus.ended,
              Started: gameStatus.started,
              Blowout: gameStatus.blowout,
            });
            // }
          }
          fetchNextPage();
        }
      });
    return respond(200);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.controlCenter = async (event: any) => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  console.log('searching for games to change');
  let games = await base('Games')
    .select({
      view: 'Scheduled',
    })
    .all();
  console.log(`found ${games.length} games`);
  games = games.filter(g => new Date(g.get('Game Start')) <= new Date());
  console.log(`found ${games.length} games now/past`);
  console.log(games);
  let changedCount = 0;
  let waitingCount = 0;
  if (games.length) {
    // loop through games
    for (const game of games) {
      console.log(game);
      const waitOn: string[] = game.get('Wait On');
      const regions: string[] = game.get('Regions');
      const channel: string = game.get('Channel');
      const gamePackage: string = game.get('Package');
      const zones: number[] = game.get('TV Zones');
      const gameNotes: string = game.get('Notes');
      const gameId: string = game.id;
      // check if game has a dependency it is waiting on
      if (waitOn && waitOn.length) {
        console.log('has depdendency game');
        const [dependencyGameId] = waitOn;
        const dependencyGame = await base('Games').find(dependencyGameId);
        const lockedUntil = dependencyGame.get('Locked Until');
        const gameOver = dependencyGame.get('Game Over');
        const blowout = dependencyGame.get('Blowout');
        const dependencyGameNotes = dependencyGame.get('Notes');
        const dependencyChannel: string = dependencyGame.get('Channel');
        const dependencyZones: number[] = dependencyGame.get('TV Zones');
        const dependencyGameStatus: string = dependencyGame.get('Game Status');
        // lockedUntil is either Blowout or Game Over
        if (lockedUntil === 'Blowout' && !blowout && !gameOver) {
          console.log(`waiting on blowout:`, dependencyGame.get('Title (Calculated)'));
          waitingCount++;
          const text = `*${gameNotes} (${channel})* waiting for *game over/blowout* on *${dependencyGameNotes} (${dependencyChannel})* ${
            process.env.stage !== 'prod' ? process.env.stage : ''
          }`;
          const attachments = [
            {
              title,
              text,
              fallback: text,
              color,
              fields: [
                {
                  title: 'Zone',
                  value: zones.join(' '),
                  short: true,
                },
                {
                  title: 'Game Status',
                  value: dependencyGameStatus,
                  short: true,
                },
              ],
            },
          ];
          const invoke = new Invoke();
          await invoke
            .service('message')
            .name('sendControlCenter')
            .body({ attachments })
            .go();
          continue;
        } else if (lockedUntil === 'Game Over' && !gameOver) {
          console.log(`waiting on game over:`, dependencyGame.get('Title (Calculated)'));
          waitingCount++;
          const text = `*${gameNotes} (${channel})* waiting for *game over* of *${dependencyGameNotes} (${dependencyChannel})* ${
            process.env.stage !== 'prod' ? process.env.stage : ''
          }`;
          const title = 'Control Center';
          const color = process.env.stage === 'prod' ? 'warning' : null; // good, warning, danger
          const attachments = [
            {
              title,
              text,
              fallback: text,
              color,
              fields: [
                {
                  title: 'Zone',
                  value: zones.join(' '),
                  short: true,
                },
                {
                  title: 'Game Status',
                  value: dependencyGameStatus,
                  short: true,
                },
              ],
            },
          ];
          const invoke = new Invoke();
          await invoke
            .service('message')
            .name('sendControlCenter')
            .body({ attachments })
            .go();
          continue;
        }
      }

      console.log(`searching for locations for:`, { regions, channel, zones, waitOn });
      // find locations that are in region and control center enabled
      const invoke = new Invoke();
      const result = await invoke
        .service('location')
        .name('controlCenterLocationsByRegion')
        .pathParams({ regions })
        .headers(event.headers)
        .go();
      const locations = result.data;

      console.log(`found ${locations.length} locations`);
      // loop through locations
      for (const location of locations) {
        // ensure location has package for game
        if (gamePackage && (!location.packages || !location.packages.includes(gamePackage))) {
          console.log(`${location.name} doesn't have ${gamePackage} package`);
          continue;
        }
        // console.log(`${location.name} has ${gamePackage} package`);

        // find boxes that have game zones
        console.log('zones', zones);
        const boxes = location.boxes.filter(
          b => zones.includes(b.zone) && (!b.reserved || (b.reserved && moment(b.end).diff(moment().toDate()) < 0)),
        );
        console.log(`found ${boxes.length} boxes`);
        // loop through boxes, change to game channel
        for (const box of boxes) {
          const command = 'tune';
          const reservation = {
            location,
            box,
            program: {
              channel: channel.split('-')[0],
              channelMinor: channel.split('-')[1],
            },
          };
          console.log('⚡ ⚡ tuning...');
          console.log('location:', location.name, location.neighborhood);
          console.log('box', box.label, box.ip);
          console.log('channel', channel);
          const source = 'control center';
          const invoke = new Invoke();
          await invoke
            .service('remote')
            .name('command')
            .body({ reservation, command, source })
            .headers(event.headers)
            .async()
            .go();
          changedCount++;
        }
      }
      // mark game as completed on airtable
      // TODO maybe delete in future?
      await base('Games').update(gameId, {
        Zapped: true,
      });
    }
  }

  return respond(200, { changedCount, waitingCount });
};

function getChannelForZone(index) {
  const initChannels = [206, 209, 614, 208, 212, 219];
  return initChannels[index % initChannels.length];
}

module.exports.getChannelForZone = getChannelForZone;
