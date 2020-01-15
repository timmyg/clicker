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
let AWS;
if (!process.env.IS_LOCAL) {
  AWS = require('aws-xray-sdk').captureAWS(require('aws-sdk'));
} else {
  console.info('Serverless Offline detected; skipping AWS X-Ray setup');
  AWS = require('aws-sdk');
}
const { respond, getPathParameters, getBody, Raven, RavenLambdaWrapper, Invoke } = require('serverless-helpers');

if (process.env.NODE_ENV === 'test') {
  dynamoose.AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'test',
  });
}
const dbGame = dynamoose.model(
  process.env.tableGame,
  {
    start: { type: String, hashKey: true },
    id: {
      type: Number,
      rangeKey: true,
      index: {
        global: true,
        // name: 'idOnlyGlobalIndex',
        // project: false,
      },
    },
    status: {
      type: String,
      required: true,
      index: {
        global: true,
      },
    },
    leagueName: String,
    scoreboard: {
      display: String,
      clock: String,
      period: Number,
    },
    broadcast: {
      network: String,
    },
    away: {
      id: Number,
      score: Number,
      name: {
        full: String,
        short: String,
        abbr: String,
        display: String,
      },
      logo: String,
      rank: Number,
      book: {
        moneyline: Number,
        spread: Number,
      },
    },
    home: {
      id: Number,
      score: Number,
      name: {
        full: String,
        short: String,
        abbr: String,
        display: String,
      },
      logo: String,
      rank: Number,
      book: {
        moneyline: Number,
        spread: Number,
      },
    },
    book: {
      total: Number,
    },
    // dynamic
    liveStatus: Object, // GameStatus
  },
  {
    timestamps: true,
    expires: {
      ttl: 86400,
      attribute: 'expires',
      returnExpiredItems: false,
      defaultExpires: x => {
        return moment(x.start)
          .add(9, 'hours')
          .toDate();
      },
    },
  },
);
// }

class GameStatus {
  started: boolean;
  blowout: boolean;
  ended: boolean;
  description: string;
}

type actionNetworkRequest = {
  sport: string,
  params?: any,
};

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200);
});

module.exports.getStatus = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('getstatus');
  const { url: webUrl } = getBody(event);
  const parts = webUrl.split('/');
  const gameId = parts[parts.length - 1];
  const game: Game = await dbGame
    .queryOne('id')
    .eq(gameId)
    .exec();
  console.log('get game', gameId, game);
  const status: GameStatus = buildStatus(game);
  return respond(200, status);
});

function buildStatus(game: Game): GameStatus {
  const gameStatus = new GameStatus();
  gameStatus.started = ['complete', 'inprogress'].includes(game.status) ? true : false;
  gameStatus.ended = ['complete'].includes(game.status) ? true : false;
  gameStatus.description = getDescription(game);
  gameStatus.blowout = ['complete', 'inprogress'].includes(game.status) ? isBlowout(game) : false;
  return gameStatus;
}

function getDescription(game: Game): string {
  // console.log({ game44: game });
  const score = `${game.away.name.abbr} ${game.away.score || 0} @ ${game.home.name.abbr} ${game.home.score || 0}`;
  console.log('game.leagueName', game.leagueName, game.status);
  switch (game.status) {
    case 'scheduled': {
      return `${score} (${moment.tz(game.start, 'America/New_York').format('M/D h:mma')} EST)`;
    }
    case 'inprogress': {
      switch (game.leagueName) {
        case 'epl':
        case 'seriea':
        case 'laliga':
        case 'bundesliga':
        case 'ligue1': {
          return `${score} (${game.scoreboard.display})`;
        }
        default: {
          return `${score} (${game.scoreboard.clock} - ${game.scoreboard.period})`;
        }
      }
    }
    case 'complete': {
      return `${score} (${game.scoreboard.display})`;
    }
    default: {
      return '';
    }
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
    case 'nfl': {
      // 6:00 left in 4th quarter and 17+ point difference
      const isNearEnd = game.scoreboard.period === 4 && +game.scoreboard.clock.split(':')[0] <= 6;
      const isBlowout = Math.abs(game.home.score - game.away.score) >= 17;
      return isNearEnd && isBlowout;
    }
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
      return true;
  }
}

module.exports.syncActive = RavenLambdaWrapper.handler(Raven, async event => {
  const currentTime = moment()
    .subtract(5, 'hours')
    .toDate();
  const allEvents = await pullFromActionNetwork([currentTime]);
  if (allEvents && allEvents.length) {
    console.log('allEvents', allEvents.length);
    let ipAndCompletedGames = getInProgressAndCompletedGames(allEvents);
    console.log('ipAndCompletedGames', ipAndCompletedGames.length);
    let gamesToUpdate = [];
    // let updatedGames;
    if (ipAndCompletedGames && ipAndCompletedGames.length) {
      // dont update again in database if already updated...
      const alreadyCompletedGameIds = await getCompleteGameIds();
      console.log({ alreadyCompletedGameIds });
      gamesToUpdate = ipAndCompletedGames.filter(g => !alreadyCompletedGameIds.includes(g.id));
      console.log({ gamesToUpdate });
      console.log('gamesToUpdate', gamesToUpdate.length);
      if (!!gamesToUpdate.length) {
        const totalGames = gamesToUpdate.length;
        const updatedGames = await syncGamesDatabase(gamesToUpdate, false);
        const messagePromises = [];
        for (const game of updatedGames) {
          messagePromises.push(
            new Invoke()
              .service('program')
              .name('updateGame')
              .body(game)
              .async()
              .go(),
          );
        }
        await Promise.all(messagePromises);
        return respond(200, { updatedGames: totalGames });
      }
    }
    return respond(200, { updatedGames: 0 });
  } else {
    return respond(200, { events: 0 });
  }
});

module.exports.syncAirtable = RavenLambdaWrapper.handler(Raven, async event => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtableGamesName = 'Games';
  const allExistingGames = await base(airtableGamesName)
    .select({ fields: ['id'] })
    .all();
  const allExistingGamesIds = allExistingGames.map(g => g.get('id'));
  console.log('allExistingGamesIds', allExistingGamesIds.length);
  const daysToPull = 12; // TODO change to 12
  const datesToPull = [];
  [...Array(daysToPull)].forEach((_, i) => {
    const dateToSync = moment()
      .subtract(5, 'hrs')
      .add(i, 'days')
      .toDate();
    datesToPull.push(dateToSync);
  });
  let allEvents: any = await pullFromActionNetwork(datesToPull);
  console.log('allEvents', allEvents.length);
  allEvents = uniqBy(allEvents, 'id');
  console.log('unique events', allEvents.length);
  allEvents = allEvents.filter(e => !allExistingGamesIds.includes(e.id));
  console.log('not existing in airtable events', allEvents.length);
  console.time('create');
  let transformedGames: Game[] = [];
  allEvents.forEach(g => transformedGames.push(transformGame(g)));
  const airtableGames = buildAirtableGames(transformedGames);
  const promises = [];
  while (!!airtableGames.length) {
    try {
      const gamesSlice = airtableGames.splice(0, 10);
      console.log('batch putting:', gamesSlice.length);
      console.log('remaining:', airtableGames.length);
      promises.push(base(airtableGamesName).create(gamesSlice));
    } catch (e) {
      console.error(e);
    }
  }
  const result = await Promise.all(promises);
  console.timeEnd('create');
  return respond(200);
});

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);
  const game: Game = await dbGame
    .queryOne('id')
    .eq(parseInt(id))
    .exec();
  game.liveStatus = buildStatus(game);
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

module.exports.scoreboard = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    console.log('get games');
    console.time('all scores!');
    // const allGames: Game[] = await dbGame.scan().exec();
    let games: Game[] = await dbGame.scan().exec();
    console.log('allGames', games.length);
    games = [
      ...games.filter(g => g.status === 'inprogress'),
      ...games.filter(g => g.status === 'complete'),
      ...games.filter(g => g.status === 'scheduled'),
      ...games.filter(g => g.status === 'time-tbd'),
    ];
    console.log('sortedGames', games.length);
    games = [
      ...games.filter(g => g.leagueName === 'ncaaf'),
      ...games.filter(g => g.leagueName === 'ncaab'),
      ...games.filter(g => g.leagueName === 'nfl'),
      ...games.filter(g => g.leagueName === 'nba'),
      ...games.filter(g => !['ncaaf', 'ncaab', 'nfl', 'nba'].includes(g.leagueName)),
    ];
    console.log('sortedGames', games.length);
    return respond(200, games);
  } catch (e) {
    console.error(e);
    respond(400, e);
  }
});

function buildAirtableGames(games: Game[]) {
  const transformed = [];
  games.forEach(game => {
    // console.log({ game });
    const { id, leagueName, start } = game;
    const { full: homeTeam } = game.home.name;
    const { full: awayTeam } = game.away.name;
    console.log({ id });
    transformed.push({
      fields: {
        id,
        leagueName,
        homeTeam,
        awayTeam,
        start,
      },
    });
  });
  return transformed;
}

module.exports.syncNextFewDays = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('sync games to database for next few days...');
  const datesToPull = [
    moment().toDate(),
    moment()
      .add(1, 'd')
      .toDate(),
    moment()
      .add(2, 'd')
      .toDate(),
  ];
  console.log('sync');
  const allEvents: any = await pullFromActionNetwork(datesToPull);
  await syncGamesDatabase(allEvents, true);
  return respond(200);
});

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
  return response.filter(e => !['time-tbd', 'scheduled'].includes(e.status));
}

async function getCompleteGameIds(): Promise<number[]> {
  const completeGames: Game[] = await dbGame
    .query('status')
    .eq('complete')
    .exec();
  console.log('getCompleteGameIds', completeGames.map(g => g.id));
  return completeGames.map(g => g.id);
}

async function pullFromActionNetwork(dates: Date[]) {
  const apiUrl = 'https://api.actionnetwork.com/web/v1/scoreboard';
  const actionSports: actionNetworkRequest[] = [];
  actionSports.push({ sport: 'ncaab', params: { division: 'D1' } });
  actionSports.push({ sport: 'ncaaf', params: { division: 'FBS' } });
  actionSports.push({ sport: 'nba' });
  actionSports.push({ sport: 'nfl' });
  actionSports.push({ sport: 'mlb' });
  actionSports.push({ sport: 'nhl' });
  actionSports.push({ sport: 'soccer' }); // TODO uncomment
  // actionSports.push({ sport: 'pga' });
  // actionSports.push({ sport: 'boxing' });
  const method = 'get';
  const options = { method, url: apiUrl, timeout: 2000 };
  const requests = [];
  const actionBaseUrl = 'https://api.actionnetwork.com/web/v1/scoreboard';
  for (const actionSport: actionNetworkRequest of actionSports) {
    const url = `${actionBaseUrl}/${actionSport.sport}`;
    for (const date of dates) {
      const params = { ...actionSport.params, date: moment(date).format('YYYYMMDD') };
      const request = axios.get(url, { params });
      requests.push(request);
    }
  }
  console.log('requests:');
  console.log(require('util').inspect(requests));
  const responses = await Promise.all(requests);
  console.log('responses[0]', responses[0].config.params);
  console.log('responses[1]', responses[1].config.params);
  console.log('responses[2]', responses[2].config.params);
  console.log('responses[3]', responses[3].config.params);
  const all = [];
  responses.forEach(response => {
    const responseEvents = response.data.games ? response.data.games : response.data.competitions;
    // remove games in past, not sure why action return them (NCAAF)
    responseEvents.filter(
      e =>
        e.start_time >
        moment()
          .subtract(6, 'h')
          .toISOString(),
    );
    all.push(...responseEvents);
    console.log('all.length', all.length);
  });
  return all;
}

async function syncGamesDatabase(events: any[], deduplicate: boolean = false): Promise<Game[]> {
  console.log('all events', events.length);
  events = uniqBy(events, 'id');
  console.log('all events unique', events.length);
  if (deduplicate) {
    const existingGames = await dbGame
      .scan()
      .all()
      .exec();
    const existingUniqueGameIds = [...new Set(existingGames.map(g => g.id))];
    console.log('existingUniqueGameIds', existingUniqueGameIds.length);
    events = events.filter(e => !existingUniqueGameIds.includes(e.id));
    console.log({ events });
    console.log('new events', events.length);
  }
  events.forEach((part, index, eventsArray) => {
    eventsArray[index] = transformGame(eventsArray[index]);
  });
  // copy so we can splice array but return entire array
  const eventsCopy = JSON.parse(JSON.stringify(events));
  const { tableGame } = process.env;
  const docClient = new AWS.DynamoDB.DocumentClient();
  console.log('cleaned');

  while (!!events.length) {
    try {
      const dbEvents = events.splice(0, 25);
      console.log('batch putting:', dbEvents.length);
      console.log('remaining:', events.length);
      const result = await dbGame.batchPut(dbEvents);
      console.log({ result });
    } catch (e) {
      console.error(e);
    }
  }
  return eventsCopy;
  // await publishNewGames(eventsCopy);
  // return eventsCopy;
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
  return objectMapper(game, map);
}

module.exports.getInProgressAndCompletedGames = getInProgressAndCompletedGames;
module.exports.transformGame = transformGame;
module.exports.buildStatus = buildStatus;
