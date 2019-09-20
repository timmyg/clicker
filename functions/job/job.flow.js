// @flow
require('dotenv').config();
const Airtable = require('airtable');
const moment = require('moment');
const { respond, invokeFunctionSync } = require('serverless-helpers');

declare class process {
  static env: {
    stage: string,
    airtableKey: string,
    airtableBase: string,
  };
}

class GameStatus {
  ended: boolean;
  blowout: boolean;
  description: string;
}

module.exports.health = async (event: any) => {
  return respond(200, `hello`);
};

module.exports.controlCenterDailyInit = async (event: any) => {
  const regions = ['Cincinnati'];
  const { data: locations } = await invokeFunctionSync(
    `location-${process.env.stage}-controlCenterLocationsByRegion`,
    null,
    { regions },
    event.headers,
    null,
    'us-east-1',
  );
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
      await invokeFunctionSync(
        `remote-${process.env.stage}-command`,
        { reservation, command, source },
        null,
        null,
        null,
        'us-east-1',
      );
      i++;
    }
  }
  return respond(200);
};

module.exports.updateGameStatus = async (event: any) => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  console.log('searching for games to change');
  // TODO shouldnt be all games
  let allGames = await base('Games')
    .select({})
    .eachPage(async (allGames, fetchNextPage) => {
      console.log('allGames', allGames.length);
      if (allGames.length) {
        for (const game of allGames) {
          console.log({ game });
          const siWebUrl: string = game.get('Scores Link');
          const gameOver: boolean = game.get('Game Over');
          const blowout: boolean = game.get('Blowout');
          const gameId: string = game.id;
          const { data } = await invokeFunctionSync(
            `program-${process.env.stage}-getGameStatus`,
            { url: siWebUrl },
            null,
            event.headers,
            null,
            'us-east-1',
          );
          console.log({ data });
          const gameStatus: GameStatus = data;
          console.log({ gameStatus });
          await base('Games').update(gameId, {
            'Game Status': gameStatus.description,
            'Game Over': gameStatus.ended,
            Blowout: gameStatus.blowout,
          });
        }
        fetchNextPage();
      }
    });
  return respond(200);
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
  if (games.length) {
    // loop through games
    for (const game of games) {
      const regions: string[] = game.get('Regions');
      const channel: string = game.get('Channel');
      const gamePackage: string = game.get('Package');
      const zones: number[] = game.get('TV Zones');
      const gameId: string = game.id;
      console.log(`searching for locations for:`, { regions, channel, zones });
      // find locations that are in region and control center enabled
      const result = await invokeFunctionSync(
        `location-${process.env.stage}-controlCenterLocationsByRegion`,
        null,
        { regions },
        event.headers,
        null,
        'us-east-1',
      );
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
          await invokeFunctionSync(
            `remote-${process.env.stage}-command`,
            { reservation, command, source },
            null,
            null,
            null,
            'us-east-1',
          );
          changedCount++;
        }
      }
      // mark game as completed on airtable
      // TODO maybe delete in future?
      await base('Games').update(gameId, {
        Completed: true,
      });
    }
  }

  return respond(200, { changedCount });
};

function getChannelForZone(i) {
  const initChannels = [206, 209, 614, 208, 212, 219]; // espn, espn2, espnc, espnu, nfl, mlb
  // const initChannels = [];
  return initChannels[i % initChannels.length];
}

module.exports.getChannelForZone = getChannelForZone;
