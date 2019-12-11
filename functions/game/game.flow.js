// @flow
const axios = require('axios');
const camelcase = require('camelcase-keys');
const dynamoose = require('dynamoose');
const moment = require('moment-timezone');
const AWS = require('aws-sdk');
const objectMapper = require('object-mapper');
const _ = require('lodash');
const awsXRay = require('aws-xray-sdk');
// const types = require('clicker-types');
// const util = require('my-lib');
// import type {Game} from types;
const awsSdk = awsXRay.captureAWS(AWS);
const { respond, getPathParameters, getBody, Raven, RavenLambdaWrapper } = require('serverless-helpers');

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
  const status: GameStatus = getStatus(game);
  return respond(200, status);
});

function getStatus(game: Game): GameStatus {
  const gameStatus = new GameStatus();
  gameStatus.started = ['complete', 'inprogress'].includes(game.status) ? true : false;
  gameStatus.ended = ['complete'].includes(game.status) ? true : false;
  gameStatus.description = getDescription(game);
  gameStatus.blowout = ['complete', 'inprogress'].includes(game.status) ? isBlowout(game) : false;
  return gameStatus;
}

function getDescription(game: Game): string {
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

module.exports.syncScores = RavenLambdaWrapper.handler(Raven, async event => {
  const currentTime = moment()
    .subtract(5, 'hours')
    .toDate();
  const allEvents = await pullFromActionNetwork([currentTime]);
  if (allEvents && allEvents.length) {
    console.log('allEvents', allEvents.length);
    let ipAndCompletedGames = getInProgressAndCompletedGames(allEvents);
    console.log('ipAndCompletedGames', ipAndCompletedGames.length);
    let gamesToUpdate = [];
    if (ipAndCompletedGames && ipAndCompletedGames.length) {
      // dont update again in database if already updated...
      const alreadyCompletedGameIds = await getCompleteGameIds();
      gamesToUpdate = ipAndCompletedGames.filter(g => !alreadyCompletedGameIds.includes(g.id));
      console.log('gamesToUpdate', gamesToUpdate.length);
      if (!!gamesToUpdate.length) {
        const totalGames = gamesToUpdate.length;
        await updateGames(gamesToUpdate);
        return respond(200, { updatedGames: totalGames });
      }
    }
    return respond(200, { updatedGames: 0 });
  } else {
    return respond(200, { events: 0 });
  }
});

module.exports.getByStartTimeAndNetwork = RavenLambdaWrapper.handler(Raven, async event => {
  const { start, network } = event.queryStringParameters;
  const games: Game[] = await dbGame
    .query('start')
    .eq(start)
    // .filter(filter)
    .exec();
  const game = games.find(g => g.broadcast && g.broadcast.network === network);
  return respond(200, game);
});

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

type actionNetworkRequest = {
  sport: string,
  params?: any,
};

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200);
});

module.exports.consumeNewGame = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('consume');
  console.log(event);
  console.log(event.Records[0].body);
  return respond(200);
});

module.exports.syncSchedule = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('get games...');
  const allGames: Game[] = await dbGame.scan().exec();
  console.log('existingGames:', allGames.length);
  const datesToPull = [];
  if (allGames && allGames.length) {
    const allGamesDescending = allGames.sort((a, b) => b.start.localeCompare(a.start));
    const latestGame = allGamesDescending[0];
    console.log({ latestGame });
    // get one day more than largest start time
    const dayAfterFurthestGame = moment(latestGame.start)
      .add(1, 'd')
      .toDate();
    datesToPull.push(dayAfterFurthestGame);
  } else {
    // if no data, get today and tomorrow
    datesToPull.push(moment().toDate());
    datesToPull.push(
      moment()
        .add(1, 'd')
        .toDate(),
    );
  }
  console.log('sync');
  const allEvents: any = await pullFromActionNetwork(datesToPull);
  await updateGames(allEvents);
  await publishNewGames(allEvents);
  return respond(200);
});

async function publishNewGames(games) {
  // get game ids, publish to sns topic to update description
  const sns = new AWS.SNS({ region: 'us-east-1' });
  let i = 0;
  for (const game of games) {
    console.log(i);
    const messageData = {
      Message: JSON.stringify(game),
      TopicArn: process.env.newGameTopicArn,
    };

    try {
      await sns.publish(messageData).promise();
      i++;
    } catch (e) {
      console.error(e);
    }
  }
}

function removeEmpty(obj) {
  return Object.keys(obj).forEach(function(key) {
    if (obj[key] && typeof obj[key] === 'object') removeEmpty(obj[key]);
    else if (obj[key] == null) delete obj[key];
  });
}

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
  actionSports.push({ sport: 'soccer' });
  // actionSports.push({ sport: 'pga' });
  // actionSports.push({ sport: 'boxing' });
  const method = 'get';
  const options = { method, url: apiUrl, timeout: 2000 };
  console.log({ dates });
  for (const date of dates) {
    try {
      const requests = [];
      const actionBaseUrl = 'https://api.actionnetwork.com/web/v1/scoreboard';
      actionSports.forEach((actionSport: actionNetworkRequest) => {
        const url = `${actionBaseUrl}/${actionSport.sport}`;
        const queryDate = moment(date).format('YYYYMMDD');
        const params = actionSport.params || {};
        params.date = queryDate;
        console.log(url, { params });
        requests.push(axios.get(url, { params }));
      });

      const responses = await Promise.all(requests);
      console.log('responses', responses.length);
      const all = [];
      responses.forEach(response => {
        const responseEvents = response.data.games ? response.data.games : response.data.competitions;
        all.push(...responseEvents);
      });
      return all;
    } catch (e) {
      console.error(e);
    }
  }
}

async function updateGames(events: any[]) {
  events.forEach((part, index, eventsArray) => {
    eventsArray[index] = transformGame(eventsArray[index]);
  });
  console.log('updateGames:', events.length);
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
module.exports.getStatus = getStatus;
