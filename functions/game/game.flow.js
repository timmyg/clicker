// @flow
const Airtable = require('airtable');
const axios = require('axios');
const axiosRetry = require('axios-retry');
axiosRetry(axios, { retries: 3 });
const camelcase = require('camelcase-keys');
const dynamoose = require('dynamoose');
const moment = require('moment-timezone');
const objectMapper = require('object-mapper');
const { uniqBy } = require('lodash');
const airtableGamesName = 'Games';
const redis = require('async-redis');

let AWS;
if (!process.env.IS_LOCAL) {
  AWS = require('aws-xray-sdk').captureAWS(require('aws-sdk'));
} else {
  console.info('Serverless Offline detected; skipping AWS X-Ray setup');
  AWS = require('aws-sdk');
}
const { respond, getPathParameters, getBody, Raven, RavenLambdaWrapper, Invoke } = require('serverless-helpers');
const airtableControlCenter = 'Control Center';

class GameStatus {
  started: boolean;
  blowout: boolean;
  ended: boolean;
  description: string;
  liveRating: number;
}

if (process.env.NODE_ENV === 'test') {
  dynamoose.AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'test',
  });
}
type actionNetworkRequest = {
  sport: string,
  params?: any,
};

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200);
});

function buildStatus(game: Game): GameStatus {
  const gameStatus = new GameStatus();
  gameStatus.started = ['complete', 'inprogress'].includes(game.status) ? true : false;
  gameStatus.ended = ['complete'].includes(game.status) ? true : false;
  gameStatus.description = game.scoreboard && game.scoreboard.display;
  gameStatus.blowout = ['complete', 'inprogress'].includes(game.status) ? isBlowout(game) : false;
  gameStatus.liveRating = getLiveRating(game);
  return gameStatus;
}

function getLiveRating(game: Game): number {
  if (!game.scoreboard) return 0;
  switch (game.leagueName) {
    case 'mlb':
      if ([1, 2, 3].includes(game.scoreboard.period)) {
        return 1;
      }
      if ([4, 5, 6].includes(game.scoreboard.period)) {
        if (Math.abs(game.home.score - game.away.score) <= 2) {
          return 4;
        }
        return 2;
      }
      if (game.scoreboard.period >= 7) {
        if (Math.abs(game.home.score - game.away.score) <= 1) {
          return 9;
        } else if (Math.abs(game.home.score - game.away.score) <= 3) {
          return 5;
        } else {
          return 2;
        }
      }
    case 'nhl':
      if (game.scoreboard.period >= 3 && Math.abs(game.home.score - game.away.score) <= 1) {
        return 9;
      }
      return 2;
    case 'xfl':
    case 'nfl':
    case 'ncaaf':
      if (game.scoreboard.period >= 4 && Math.abs(game.home.score - game.away.score) <= 7) {
        return 9;
      }
      return 2;
    case 'ncaab':
      if (game.scoreboard.period >= 2 && Math.abs(game.home.score - game.away.score) <= 5) {
        return 9;
      }
      return 2;
    case 'wnba':
    case 'nba':
      if (game.scoreboard.period >= 4 && Math.abs(game.home.score - game.away.score) <= 7) {
        return 9;
      }
      return 2;
    case 'epl':
    case 'seriea':
    case 'laliga':
    case 'bundesliga':
    case 'ligue1':
      // const isNearEnd = game.scoreboard.period === 2 && +game.scoreboard.clock >= 80;
      // const isBlowout = Math.abs(game.home.score - game.away.score) >= 3;
      // return isNearEnd && isBlowout;
      if (+game.scoreboard.clock >= 80 && Math.abs(game.home.score - game.away.score) <= 1) {
        return 9;
      }
      return 2;
    default:
      return 0;
  }
}

function isBlowout(game: Game): boolean {
  switch (game.leagueName) {
    case 'mlb': {
      // 8th inning and 5+ run difference
      const isNearEnd = game.scoreboard.period >= 8;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 5;
      return isNearEnd && isBlowout;
    }
    case 'nhl': {
      // 3rd period, 8 minutes and 3+ goal difference
      const isNearEnd = game.scoreboard.period === 3 && +game.scoreboard.clock.split(':')[0] <= 8;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 3;
      return isNearEnd && isBlowout;
    }
    case 'xfl':
    case 'nfl':
      // 6:00 left in 4th quarter and 17+ point difference
      const isNearEnd = game.scoreboard.period === 4 && +game.scoreboard.clock.split(':')[0] <= 6;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 17;
      return isNearEnd && isBlowout;

    case 'ncaaf': {
      // 6:00 left in 4th quarter and 17+ point difference
      const isNearEnd = game.scoreboard.period === 4 && +game.scoreboard.clock.split(':')[0] <= 6;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 17;
      return isNearEnd && isBlowout;
    }
    case 'ncaab': {
      // 8:00 left in 2nd half and 20+ point difference
      const isNearEnd = game.scoreboard.period === 2 && +game.scoreboard.clock.split(':')[0] <= 8;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 20;
      return isNearEnd && isBlowout;
    }
    case 'wnba':
    case 'nba': {
      // 6:00 left in 4th quarter and 25+ point difference
      const isNearEnd = game.scoreboard.period === 4 && +game.scoreboard.clock.split(':')[0] <= 6;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 25;
      return isNearEnd && isBlowout;
    }
    // TODO support others
    case 'epl':
    case 'seriea':
    case 'laliga':
    case 'bundesliga':
    case 'ligue1': {
      // 80th minutes and 3+ goal difference
      const isNearEnd = game.scoreboard.period === 2 && +game.scoreboard.clock >= 80;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 3;
      return isNearEnd && isBlowout;
    }
    default:
      return false;
  }
}

module.exports.syncActiveAirtable = RavenLambdaWrapper.handler(Raven, async () => {
  const timeToPull = moment()
    .subtract(12, 'hours')
    .toDate();
  // get everything from AN
  const allActionEvents = await pullFromActionNetwork([timeToPull]);
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const allExistingAirtableGames = await base(airtableGamesName)
    .select({
      fields: ['id', 'statusDisplay', 'recordId'],
    })
    .all();
  const airtableCreates = [];
  const airtableUpdates = [];
  for (const actionGame of allActionEvents) {
    // check if game existing in airtable
    const existingAirtableGame = allExistingAirtableGames.find(atGame => atGame.fields.id === actionGame.id);
    // create if not
    if (!existingAirtableGame) {
      const newAirtableGame = {
        fields: transformGameActionToAirtable(actionGame),
      };
      console.info('creating', newAirtableGame);
      // airtableCreatePromises.push(base(airtableGamesName).create(newAirtableGame));
      airtableCreates.push(newAirtableGame);
      continue;
    }
    // if status is not same, update
    if (existingAirtableGame.fields.statusDisplay != actionGame.status_display) {
      const gameToUpdate = {
        fields: transformGameActionToAirtable(actionGame),
        id: existingAirtableGame.fields.recordId,
      };
      console.log('updating', gameToUpdate);
      // airtableUpdatePromises.push(base(airtableGamesName).update(gameToUpdate));
      airtableUpdates.push(gameToUpdate);
      continue;
    }
  }
  const promisesSliced = [];
  while (!!airtableCreates.length) {
    try {
      const slice = airtableCreates.splice(0, 10);
      console.log('hii!', slice[0]);
      promisesSliced.push(base(airtableGamesName).create(slice));
    } catch (e) {
      console.error(e);
    }
  }
  while (!!airtableUpdates.length) {
    try {
      const slice = airtableUpdates.splice(0, 10);
      promisesSliced.push(base(airtableGamesName).update(slice));
    } catch (e) {
      console.error(e);
    }
  }
  await Promise.all(promisesSliced);
  return respond(200);
});

module.exports.syncAirtable = RavenLambdaWrapper.handler(Raven, async event => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const allExistingGames = await base(airtableGamesName)
    .select({ fields: ['id', 'start'] })
    .all();
  const allExistingGamesIds = allExistingGames.map(g => g.get('id'));
  console.log('allExistingGamesIds', allExistingGamesIds.length);
  const daysToPull = 2;
  const datesToPull = [];
  [...Array(daysToPull)].forEach((_, i) => {
    const dateToSync = moment()
      .subtract(5, 'hrs')
      .add(i, 'days')
      .toDate();
    datesToPull.push(dateToSync);
  });
  const allEvents: any = await pullFromActionNetwork(datesToPull);
  console.log('allEvents', allEvents.length);
  let eventsNew = uniqBy(allEvents, 'id');
  console.log('unique events', eventsNew.length);
  eventsNew = eventsNew.filter(e => !allExistingGamesIds.includes(e.id));
  console.log('not existing in airtable events', eventsNew.length);
  console.time('create');
  let transformedGames: Game[] = [];
  eventsNew.forEach(g => transformedGames.push(g.teams ? transformGame(g) : transformNonGame(g)));
  const airtableGames = buildAirtableGames(transformedGames);
  const promises = [];
  console.log('creating games:', airtableGames.length);
  while (!!airtableGames.length) {
    try {
      const gamesSlice = airtableGames.splice(0, 10);
      promises.push(base(airtableGamesName).create(gamesSlice));
    } catch (e) {
      console.error(e);
    }
  }
  const result = await Promise.all(promises);
  console.timeEnd('create');

  console.time('update');
  console.log('allEvents', allEvents.length);
  let eventsUpdated = allEvents.filter(e => {
    const airtableGame = allExistingGames.find(g => g.get('id') === e.id);
    // console.log('isUpdated?', airtableGame, e);
    // if (airtableGame.get('id') === 85704) {
    //   console.log(airtableGame.get('id'), airtableGame.get('start'), e.start_time);
    // }
    if (!!airtableGame && airtableGame.get('start') !== e.start_time) {
      return true;
    }
    return false;
  });
  console.log('events to update', eventsUpdated.length);
  transformedGames = [];
  eventsUpdated.forEach(g => transformedGames.push(g.teams ? transformGame(g) : transformNonGame(g)));
  const airtableGamesUpdated = buildAirtableGames(transformedGames);
  airtableGamesUpdated.map(atg => {
    atg['id'] = allExistingGames.find(eg => eg.fields.id === atg.fields.id).id;
  });
  const promisesUpdated = [];
  console.log('updating games:', airtableGamesUpdated.length);
  while (!!airtableGamesUpdated.length) {
    try {
      const gamesSliceUpdated = airtableGamesUpdated.splice(0, 10);
      promisesUpdated.push(base(airtableGamesName).update(gamesSliceUpdated));
    } catch (e) {
      console.error(e);
    }
  }
  const result2 = await Promise.all(promisesUpdated);
  console.timeEnd('update');

  return respond(200);
});

// module.exports.updateAirtableGamesStatus = RavenLambdaWrapper.handler(Raven, async event => {
//   const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
//   console.log('searching for games to update');
//   try {
//     const programs = await base(airtableControlCenter)
//       .select({
//         filterByFormula: `AND( {gameId} != BLANK(), {gameOver} != TRUE(), {startHoursFromNow} >= -6, {startHoursFromNow} <= 1 )`,
//       })
//       .all();

//     console.log(`found ${programs.length} programs`);
//     if (programs.length) {
//       for (const program of programs) {
//         const recordId: string = program.id;
//         const gameId: number = program.get('gameId');
//         const game: Game = await dbGame
//           .queryOne('id')
//           .eq(gameId)
//           .exec();
//         console.log({ recordId, gameId, game });
//         if (game) {
//           if (game.summary) {
//             await base(airtableControlCenter).update(recordId, {
//               gameOver: game.summary.ended,
//               gameStatus: game.summary.description,
//             });
//           }
//         } else {
//           await new Invoke()
//             .service('notification')
//             .name('sendControlCenter')
//             .body({ text: `game not found: ${gameId}` })
//             .async()
//             .go();
//         }
//       }
//     }
//     return respond(200);
//   } catch (e) {
//     console.error(e);
//     Raven.captureException(e);
//   }
// });

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);
  const redisExpirationSeconds = 60;

  // redis check if in cache
  const redisClient = redis.createClient({
    host: process.env.redisHost,
    password: process.env.redisPassword,
    port: process.env.redisPort,
  });
  const redisGameKey = `game.${id}.${process.env.stage}`;
  const gameCache = await redisClient.get(redisGameKey);
  if (!!gameCache) {
    console.log('got from cache!', JSON.parse(gameCache));
    await redisClient.quit();
    return respond(200, JSON.parse(gameCache));
  }
  console.log('not in cache :(');

  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtableGame = await base(airtableGamesName).find(id);
  console.log({ airtableGame });
  const { recordId, homeTeam, awayTeam, isOver, status, statusDisplay } = airtableGame.fields;
  console.log({ recordId, homeTeam, awayTeam, isOver, status, statusDisplay });
  const game = {
    id: recordId,
    title: `${awayTeam} @ ${homeTeam}`,
    isOver,
    status,
    statusDisplay,
  };
  console.log({ game });
  await redisClient.set(redisGameKey, JSON.stringify(game), 'EX', redisExpirationSeconds);
  await redisClient.quit();

  return respond(200, game);
});

// module.exports.getByStartTimeAndNetwork = RavenLambdaWrapper.handler(Raven, async event => {
//   const { start, network } = event.queryStringParameters;
//   const games: Game[] = await dbGame
//     .query('start')
//     .eq(start) // .filter(filter)
//     .exec();
//   const game = games.find(g => g.broadcast && g.broadcast.network === network);
//   return respond(200, game);
// });

// module.exports.scoreboard = RavenLambdaWrapper.handler(Raven, async event => {
//   console.log('get games');
//   console.time('all scores!');
//   // const allGames: Game[] = await dbGame.scan().exec();
//   let games: Game[] = await dbGame.scan().exec();
//   console.log('allGames', games.length);
//   games = [
//     ...games.filter(g => g.status === 'inprogress'),
//     ...games.filter(g => g.status === 'complete'),
//     ...games.filter(g => g.status === 'scheduled'),
//     ...games.filter(g => g.status === 'time-tbd'),
//   ];
//   console.log('sortedGames', games.length);
//   games = [
//     ...games.filter(g => g.leagueName === 'ncaaf'),
//     ...games.filter(g => g.leagueName === 'ncaab'),
//     ...games.filter(g => g.leagueName === 'nfl'),
//     ...games.filter(g => g.leagueName === 'nba'),
//     ...games.filter(g => !['ncaaf', 'ncaab', 'nfl', 'nba'].includes(g.leagueName)),
//   ];
//   console.log('sortedGames', games.length);
//   return respond(200, games);
// });

// module.exports.scoreboardLiveUpcoming = RavenLambdaWrapper.handler(Raven, async event => {
//   const gamesCount = 5;

//   const inProgressGamesPromise: Game[] = dbGame
//     .query('status')
//     .eq('inprogress')
//     .exec();

//   const upcomingGamesPromise: Game[] = dbGame
//     .query('status')
//     .eq('scheduled')
//     .exec();

//   console.time('games');
//   let [inProgressGames, upcomingGames] = await Promise.all([inProgressGamesPromise, upcomingGamesPromise]);
//   console.timeEnd('games');

//   inProgressGames = inProgressGames
//     .filter(g => moment(g.start) > moment().subtract(2, 'h') && moment(g.start) < moment().add(1, 'd'))
//     .filter(g => ['ncaaf', 'ncaab', 'nfl', 'nba', 'mlb', 'nhl'].includes(g.leagueName))
//     .filter(g => !!g.broadcast)
//     .sort((a, b) => a.start.localeCompare(b.start));
//   upcomingGames = upcomingGames
//     .filter(g => moment(g.start) > moment().subtract(2, 'h') && moment(g.start) < moment().add(1, 'd'))
//     .filter(g => ['ncaaf', 'ncaab', 'nfl', 'nba', 'mlb', 'nhl'].includes(g.leagueName))
//     .filter(g => !!g.broadcast)
//     .sort((a, b) => a.start.localeCompare(b.start));

//   let games = upcomingGames;

//   if (inProgressGames && inProgressGames[0]) {
//     games = [inProgressGames[0], ...games];
//   }

//   games = games.slice(0, gamesCount);
//   return respond(200, games);
// });

function buildAirtableGames(games: Game[]) {
  const transformed = [];
  games.forEach(game => {
    // console.log({ game });
    // console.log({ game });
    const { id, leagueName, start, broadcast } = game;
    const homeTeam = game.home ? game.home.name.full : '';
    const awayTeam = game.away ? game.away.name.full : '';
    console.log({ id });
    transformed.push({
      // id,
      fields: {
        id,
        leagueName,
        homeTeam,
        awayTeam,
        start,
        channelTitle: broadcast ? broadcast.network : '',
      },
    });
  });
  return transformed;
}

// module.exports.syncNextFewDays = RavenLambdaWrapper.handler(Raven, async event => {
//   console.log('sync games to database for next few days...');
//   const datesToPull = [
//     moment().toDate(),
//     moment()
//       .add(1, 'd')
//       .toDate(),
//     moment()
//       .add(2, 'd')
//       .toDate(),
//   ];
//   console.log('sync');
//   const allEvents: any = await pullFromActionNetwork(datesToPull);
//   await syncGamesDatabase(allEvents, true);
//   return respond(200);
// });

// module.exports.consumeUpdatedGameUpdateProgram = RavenLambdaWrapper.handler(Raven, async (event) => {
// 	const game: Game = JSON.parse(event.Records[0].body);
// 	await new Invoke().service('program').name('updateGame').body(game).async().go();
// 	console.log(game);
// });

// async function publishNewGames(games) {
//   // get game ids, publish to sns topic to update description
//   const sns = new AWS.SNS({ region: 'us-east-1' });
//   let i = 0;
//   const messagePromises = [];
//   for (const game of games) {
//     const messagePromise = sns
//       .publish({
//         Message: JSON.stringify(game),
//         TopicArn: process.env.newGameTopicArn,
//       })
//       .promise();
//     messagePromises.push(messagePromise);
//     i++;
//   }
//   console.time(`publish ${messagePromises.length} messages`);
//   console.log(messagePromises[0]);
//   const [first] = await Promise.all(messagePromises);
//   console.log({ first });
//   console.timeEnd(`publish ${messagePromises.length} messages`);
//   return respond(200);
// }

function getInProgressAndCompletedGames(response: any): Game[] {
  // return response.filter(e => !['time-tbd', 'scheduled', 'postponed', 'delayed', 'cancelled'].includes(e.status));
  return response.filter(e => ['inprogress', 'complete'].includes(e.status));
}

// async function getCompleteGameIds(): Promise<number[]> {
//   const completeGames: Game[] = await dbGame
//     .query('status')
//     .eq('complete')
//     .exec();
//   console.log(
//     'getCompleteGameIds',
//     completeGames.map(g => g.id),
//   );
//   return completeGames.map(g => g.id);
// }

async function pullFromActionNetwork(dates: Date[]) {
  const apiUrl = 'https://api.actionnetwork.com/web/v1/scoreboard';
  const actionSports: actionNetworkRequest[] = [];
  actionSports.push({ sport: 'ncaab', params: { division: 'D1' } });
  actionSports.push({ sport: 'ncaaf', params: { division: 'FBS' } });
  actionSports.push({ sport: 'nba' });
  actionSports.push({ sport: 'nfl' });
  actionSports.push({ sport: 'mlb' });
  actionSports.push({ sport: 'nhl' });
  actionSports.push({ sport: 'soccer' });
  actionSports.push({ sport: 'xfl' });
  actionSports.push({ sport: 'pga' });
  actionSports.push({ sport: 'boxing' });
  actionSports.push({ sport: 'ufc' });
  const method = 'get';
  const options = { method, url: apiUrl, timeout: 2000 };
  const requests = [];
  const actionBaseUrl = 'https://api.actionnetwork.com/web/v1/scoreboard';
  for (const actionSport: actionNetworkRequest of actionSports) {
    const url = `${actionBaseUrl}/${actionSport.sport}`;
    for (const date of dates) {
      const params = {
        ...actionSport.params,
        date: moment(date).format('YYYYMMDD'),
      };
      const request = axios.get(url, { params });
      requests.push(request);
    }
  }
  // console.log('requests:');
  // console.log(require('util').inspect(requests));
  const responses = await Promise.all(requests);
  // console.log('responses[0]', responses[0].config.params);
  // console.log('responses[1]', responses[1].config.params);
  // console.log('responses[2]', responses[2].config.params);
  // console.log('responses[3]', responses[3].config.params);
  const all = [];
  responses.forEach(response => {
    let responseEvents = response.data.games ? response.data.games : response.data.competitions;
    // remove games in past, not sure why action return them (NCAAF)
    responseEvents = responseEvents.filter(
      e =>
        e.start_time >
        moment()
          .subtract(12, 'h')
          .toISOString(),
    );
    all.push(...responseEvents);
    // console.log('all.length', all.length);
  });
  return all;
}

function transformGameActionToAirtable(game: any) {
  const away = game.teams.find(t => t.id === game.away_team_id);
  const home = game.teams.find(t => t.id === game.home_team_id);
  const map = {
    id: 'id',
    start_time: 'start',
    status: 'status',
    status_display: 'statusDisplay',
    'broadcast.network': 'channelTitle',
    league_name: 'leagueName',
    status: 'status',
  };
  const transformedGame = objectMapper(game, map);
  transformedGame.homeTeam = home.full_name;
  transformedGame.awayTeam = away.full_name;
  // console.log({ transformedGame });
  transformedGame.isOver = transformedGame.status === 'complete';

  return transformedGame;
}

function transformNonGame(game: any): Game {
  const map = {
    id: 'id',
    start_time: 'start',
    status_display: 'scoreboard.display',
    league_name: 'leagueName',
    status: 'status',
    'boxscore.clock': 'scoreboard.clock',
    'boxscore.period': 'scoreboard.period',
    'broadcast.network': 'broadcast.network',
  };
  const transformedGame = objectMapper(game, map);
  transformedGame.summary = buildStatus(transformedGame);
  return transformedGame;
}

function transformGame(game: any): Game {
  // set away, home teams
  game.away = game.teams.find(t => t.id === game.away_team_id);
  game.home = game.teams.find(t => t.id === game.home_team_id);
  delete game.teams;

  // attach rank, if available
  if (!!game.ranks) {
    const awayRank = game.ranks.find(gr => gr.team_id === game.away.id);
    game.away.rank = awayRank ? awayRank.rank : null;
    const homeRank = game.ranks.find(gr => gr.team_id === game.home.id);
    game.home.rank = homeRank ? homeRank.rank : null;
  }

  const map = {
    id: 'id',
    start_time: 'start',
    status_display: 'scoreboard.display',
    league_name: 'leagueName',
    status: 'status',
    'boxscore.clock': 'scoreboard.clock',
    'boxscore.period': 'scoreboard.period',
    'broadcast.network': 'broadcast.network',
    'boxscore.total_away_points': 'away.score',
    'boxscore.total_home_points': 'home.score',
    'away.full_name': 'away.name.full',
    'home.full_name': 'home.name.full',
    'away.abbr': 'away.name.abbr',
    'home.abbr': 'home.name.abbr',
    'away.short_name': 'away.name.short',
    'home.short_name': 'home.name.short',
    'away.display_name': 'away.name.display',
    'home.display_name': 'home.name.display',
    'away.logo': 'away.logo',
    'home.logo': 'home.logo',
    'away.id': 'away.id',
    'home.id': 'home.id',
    'away.rank': 'away.rank',
    'home.rank': 'home.rank',
    'odds[0].total': 'book.total',
    'odds[0].ml_away': 'away.book.moneyline',
    'odds[0].ml_home': 'home.book.moneyline',
    'odds[0].spread_away': 'away.book.spread',
    'odds[0].spread_home': 'home.book.spread',
  };
  if (game.broadcast && game.broadcast.network) {
    switch (game.broadcast.network) {
      case 'Fox Sports 1':
        game.broadcast.network = 'FS1';
        break;
      case 'Fox Sports 2':
        game.broadcast.network = 'FS2';
        break;
      case 'CBS Sports Network':
        game.broadcast.network = 'CBSSN';
        break;
      case 'Pac-12 Network':
        game.broadcast.network = 'P12';
        break;
      case 'SEC Network':
        game.broadcast.network = 'SEC';
        break;
      case 'ACC Network':
        game.broadcast.network = 'ACC';
        break;
      case 'ACC Network Extra':
        game.broadcast.network = 'ACCX';
        break;
      case 'WAC Digital Network':
        game.broadcast.network = 'WAC';
        break;
      default:
        break;
    }
  }
  const transformedGame = objectMapper(game, map);
  transformedGame.summary = buildStatus(transformedGame);
  // team.book.spread > 0 ? `+${team.book.spread}` : team.book.spread;
  try {
    const { home, away } = transformedGame;
    console.log('hi', transformedGame.home.book);
    transformedGame.home.book.spread =
      parseFloat(home.book.spread) > 0 ? `+${home.book.spread}` : `${home.book.spread}`;
    transformedGame.away.book.spread =
      parseFloat(away.book.spread) > 0 ? `+${away.book.spread}` : `${away.book.spread}`;
    transformedGame.home.book.moneyline =
      parseFloat(home.book.moneyline) > 0 ? `+${home.book.moneyline}` : `${home.book.moneyline}`;
    transformedGame.away.book.moneyline =
      parseFloat(away.book.moneyline) > 0 ? `+${away.book.moneyline}` : `${away.book.moneyline}`;
  } catch (e) {
    console.error(e);
  }
  return transformedGame;
}

module.exports.getInProgressAndCompletedGames = getInProgressAndCompletedGames;
module.exports.transformGame = transformGame;
module.exports.buildStatus = buildStatus;
