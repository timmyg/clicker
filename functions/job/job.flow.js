// @flow
const Airtable = require('airtable');
const moment = require('moment');
const { respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const airtableControlCenterV1 = 'Control Center v1';

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

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.controlCenterDailyInit = RavenLambdaWrapper.handler(Raven, async event => {
  // TODO pull actual regions
  const regions = ['cincinnati'];
  const { data: locations }: { data: Venue[] } = await new Invoke()
    .service('location')
    .name('controlCenterLocationsByRegion')
    .pathParams({ regions })
    .headers(event.headers)
    .go();
  for (location of locations) {
    const boxes = location.boxes.filter(b => b.zone).sort((a, b) => a.zone.localeCompare(b.zone));
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
      await new Invoke()
        .service('remote')
        .name('command')
        .body({ reservation, command, source })
        .async()
        .go();
      i++;
    }
  }
  return respond(200);
});

function getChannelForZone(ix: number): number {
  const initChannels = [206, 209, 212, 219, 213];
  return initChannels[ix % initChannels.length];
}

module.exports.syncLocationsBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  // TODO pull actual regions
  const regions = ['cincinnati'];
  const { data: locations }: { data: Venue[] } = await new Invoke()
    .service('location')
    .name('controlCenterLocationsByRegion')
    .pathParams({ regions })
    .headers(event.headers)
    .go();
  for (location of locations) {
    const { losantId } = location;
    console.log(`sync box (${location.name}):`, { losantId });
    await new Invoke()
      .service('remote')
      .name('syncWidgetBoxes')
      .body({ losantId })
      .async()
      .go();
    const text = `Boxes Synced @ ${location.name} (${location.neighborhood})`;
    await new Invoke()
      .service('notification')
      .name('sendAntenna')
      .body({ text })
      .async()
      .go();
  }
  return respond(200);
});

// ccv1
module.exports.updateAllGamesStatus = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
    console.log('searching for games to update score');
    // try {
    let allGames = await base(airtableControlCenterV1)
      .select({
        view: 'Score Update',
      })
      .all();
    // .eachPage(
    // async (allGames, fetchNextPage) => {
    console.log('allGames', allGames.length);
    if (allGames.length) {
      for (const game of allGames) {
        const siWebUrl: string = game.get('Scores Link');
        try {
          console.log({ game });
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
          await base(airtableControlCenterV1).update(gameId, {
            'Game Status': gameStatus.description,
            'Game Over': gameStatus.ended,
            Started: gameStatus.started,
            Blowout: gameStatus.blowout || false,
          });
          // }
        } catch (e) {
          Raven.captureException(e);
        }
      }
      // fetchNextPage();
    }
    return respond(200);
  } catch (e) {
    console.error(`failed to updateAllGamesStatus`);
    console.error(e);
    Raven.captureException(e);
    return respond(400);
  }
});

module.exports.controlCenter = RavenLambdaWrapper.handler(Raven, async event => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  console.log('searching for games to change');
  let games = await base(airtableControlCenterV1)
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
      const channel: string = game.get('Channel Number');
      const gamePackage: string = game.get('Package');
      const zones: number[] = game.get('TV Zones');
      const gameNotes: string = game.get('Notes');
      const gameId: string = game.id;
      // check if game has a dependency it is waiting on
      if (waitOn && waitOn.length) {
        console.log('has depdendency game');
        const [dependencyGameId] = waitOn;
        const dependencyGame = await base(airtableControlCenterV1).find(dependencyGameId);
        const lockedUntil = dependencyGame.get('Locked Until');
        const gameOver = dependencyGame.get('Game Over');
        const blowout = dependencyGame.get('Blowout');
        const dependencyGameNotes = dependencyGame.get('Notes');
        const dependencyChannel: string = dependencyGame.get('Channel Number');
        const dependencyZones: number[] = dependencyGame.get('TV Zones');
        const dependencyGameStatus: string = dependencyGame.get('Game Status');
        // lockedUntil is either Blowout or Game Over
        if (lockedUntil === 'Blowout' && !blowout && !gameOver) {
          console.log(`waiting on blowout:`, dependencyGame.get('Title (Calculated)'));
          waitingCount++;
          const text = `*${gameNotes} (${channel})* waiting for *game over/blowout* (${dependencyGameStatus}) on *${dependencyGameNotes} (${dependencyChannel})* (Zones ${zones.join(
            ', ',
          )})`;

          await new Invoke()
            .service('notification')
            .name('sendControlCenter')
            .body({ text })
            .async()
            .go();
          continue;
        } else if (lockedUntil === 'Game Over' && !gameOver) {
          console.log(`waiting on game over:`, dependencyGame.get('Title (Calculated)'));
          waitingCount++;
          const text = `*${gameNotes} (${channel})* waiting for *game over* (${dependencyGameStatus}) on *${dependencyGameNotes} (${dependencyChannel})* (Zones ${zones.join(
            ', ',
          )})`;
          await new Invoke()
            .service('notification')
            .name('sendControlCenter')
            .body({ text })
            .async()
            .go();
          continue;
        }
      }

      console.log(`searching for locations for:`, { regions, channel, zones, waitOn });
      // find locations that are in region and control center enabled
      const { data: locations }: { data: Venue[] } = await new Invoke()
        .service('location')
        .name('controlCenterLocationsByRegion')
        .pathParams({ regions })
        .headers(event.headers)
        .go();

      console.log(`found ${locations.length} locations`);
      // loop through locations
      for (const location of locations) {
        // ensure location has package for game
        console.log(gamePackage, location.packages);
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
          await new Invoke()
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
      await base(airtableControlCenterV1).update(gameId, {
        Zapped: true,
      });
    }
  }

  return respond(200, { changedCount, waitingCount });
});

module.exports.getChannelForZone = getChannelForZone;
