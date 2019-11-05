// @flow
const axios = require('axios');
const AWS = require('aws-sdk');
const { respond, getPathParameters, getBody, Raven, RavenLambdaWrapper } = require('serverless-helpers');
let Game;

function init() {
  Game = dynamoose.model(
    process.env.tableGame,
    {
      id: {
        type: Number,
        hashKey: true,
      },
      network: { type: String, index: true, global: true },
      start_time: { type: String, index: true, global: true },
    },
    {
      timestamps: true,
      expires: {
        ttl: 86400,
        attribute: 'expires',
        returnExpiredItems: false,
        defaultExpires: x => {
          // expire 9 hours after start
          return moment(x.start_time)
            .add(9, 'hours')
            .toDate();
        },
      },
    },
  );
}

class SiLeague {
  name: string; // Major League Baseball, College Football
  abbreviation: string; // MLB, NCAAF
}

class SiTeam {
  title: string; // Iowa State Cyclones
  abbreviation: string; // Tulane
  score: number; // 17
  is_winner: boolean; // false
}

class SiStatus {
  period: {
    id: number, // 4
    name: string, // 4th
    unit: string, // Quarter
    time: string, // 8:04
  };
  time: { minutes: number, seconds: number, additionalMinutes: number }; // soccer
  inning: number; // 1
  name: string; // Final, Pre-Game
  is_active: boolean; // false
  inning_division: string; // "Top"
}

class SiGame {
  tv: string;
  status: SiStatus;
  teams: SiTeam[];
  league: SiLeague;
}

class SiResult {
  status: string;
  data: SiGame;
}

class GameStatus {
  started: boolean;
  blowout: boolean;
  ended: boolean;
  description: string;
}

module.exports.getStatus = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('getstatus');
  const { url: webUrl } = getBody(event);
  const apiUrl = transformSIUrl(webUrl);

  const method = 'get';
  const options = { method, url: apiUrl, timeout: 2000 };
  try {
    const result = await axios(options);
    console.log(result.data);
    const gameStatus: GameStatus = transformGame(result.data);

    return respond(200, gameStatus);
  } catch (e) {
    console.error(`failed to get score: ${apiUrl}`);
    Raven.captureException(e);
    return respond(400);
  }
});

function transformGame(result: SiResult): GameStatus {
  const game = result.data;
  const gameStatus = new GameStatus();
  const { name: status } = game.status;

  // set started, ended
  if (status === 'Final') {
    gameStatus.started = true;
    gameStatus.ended = true;
  } else if (status === 'In-Progress') {
    gameStatus.started = true;
    gameStatus.ended = false;
  } else if (status === 'Pre-Game') {
    gameStatus.started = false;
  } else {
    console.error(`unknown result status: ${status}`);
  }

  const { abbreviation: leageAbbreviation } = game.league;
  const [homeTeam, awayTeam] = game.teams; // looks like first team is always home
  // set blowout
  if (status === 'In-Progress') {
    if (leageAbbreviation === 'NCAAF') {
      // 6:00 left in 4th quarter and 17+ point difference
      const isNearEnd = game.status.period.id === 4 && +game.status.period.time.split(':')[0] <= 6;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 17;
      gameStatus.blowout = isNearEnd && isBlowout;
    } else if (leageAbbreviation === 'NFL') {
      // 6:00 left in 4th quarter and 17+ point difference
      const isNearEnd = game.status.period.id === 4 && +game.status.period.time.split(':')[0] <= 6;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 17;
      gameStatus.blowout = isNearEnd && isBlowout;
    } else if (leageAbbreviation === 'MLB') {
      // 8th inning and 5+ run difference
      const isNearEnd = game.status.inning >= 8;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 5;
      gameStatus.blowout = isNearEnd && isBlowout;
    } else if (leageAbbreviation === 'NCAAB') {
      // 8:00 left in 2nd half and 20+ point difference
      const isNearEnd = game.status.period.id === 2 && +game.status.period.time.split(':')[0] <= 8;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 20;
      gameStatus.blowout = isNearEnd && isBlowout;
    } else if (['NBA', 'WNBA'].includes(leageAbbreviation)) {
      // 6:00 left in 4th quarter and 25+ point difference
      const isNearEnd = game.status.period.id === 4 && +game.status.period.time.split(':')[0] <= 6;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 25;
      gameStatus.blowout = isNearEnd && isBlowout;
    } else if (['EPL'].includes(leageAbbreviation)) {
      // 80th minutes and 3+ goal difference
      const isNearEnd = game.status.period.id === 2 && +game.status.time.minutes >= 80;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 3;
      gameStatus.blowout = isNearEnd && isBlowout;
    } else if (['NHL'].includes(leageAbbreviation)) {
      // 3rd period, 8 minutes and 3+ goal difference
      const isNearEnd = game.status.period.id === 3 && +game.status.period.time.split(':')[0] <= 8;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 3;
      gameStatus.blowout = isNearEnd && isBlowout;
    }
  }

  // set description
  gameStatus.description = `${awayTeam.abbreviation} ${awayTeam.score || 0} @ ${
    homeTeam.abbreviation
  } ${homeTeam.score || 0}`;
  if (status === 'In-Progress') {
    if (['NFL', 'NCAAF', 'NCAAB', 'NBA', 'WNBA', 'NHL'].includes(leageAbbreviation)) {
      gameStatus.description += ` (${game.status.period.time} ${game.status.period.name})`;
    } else if (['MLB'].includes(leageAbbreviation)) {
      gameStatus.description += ` (${game.status.inning_division} ${game.status.inning})`;
    } else if (['EPL'].includes(leageAbbreviation)) {
      gameStatus.description += ` (${game.status.time.minutes}:${game.status.time.seconds} ${game.status.period.name})`;
    }
  } else if (status === 'Final') {
    gameStatus.description += ` (Final)`;
  } else if (status === 'Pre-Game') {
    gameStatus.description += ` (Pre-Game)`;
  }

  return gameStatus;
}

function transformSIUrl(webUrl: string): string {
  const urlParts = webUrl.split('/');
  let apiUrl = ['https://stats.api.si.com/v1'];
  let sport = urlParts[3];
  if (sport === 'college-football') {
    sport = 'ncaaf';
  }

  if (['epl', 'mls', 'la-liga', 'serie-a'].includes(decodeURIComponent(sport))) {
    apiUrl.push('soccer');
    apiUrl.push(`game_detail?id=${urlParts[5]}&league=${sport}`);
  } else {
    apiUrl.push(sport);
    apiUrl.push(`game_detail?id=${urlParts[5]}`);
  }
  return apiUrl.join('/');
}

module.exports.getByStartTimeAndNetwork = RavenLambdaWrapper.handler(Raven, async event => {
  const { start, network } = event.queryStringParameters;
  console.log({ start, network });
  const game = await getGame(start, network);
  respond(200, game);
});

// async function abstraction
async function getGame(start, network) {
  var params = {
    TableName: process.env.tableGame,
    Key: { start, network },
  };
  try {
    console.log({ params });
    const docClient = new AWS.DynamoDB.DocumentClient();
    const data = await docClient.get(params).promise();
    console.log({ data });
    return data.Item;
  } catch (e) {
    console.error(e);
    return e;
  }
}

class actionNetworkRequest {
  sport: string;
  responseField: string; // games/competitions
  params: [{ key: string, value: string }];
}
module.exports.sync = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('sync');
  const apiUrl = 'https://api.actionnetwork.com/web/v1/scoreboard';

  const actionSports: actionNetworkRequest[] = [];
  actionSports.push({ sport: 'ncaab', params: [{ division: 'D1' }] });
  actionSports.push({ sport: 'ncaaf', params: [{ division: 'FBS' }] });
  actionSports.push({ sport: 'nfl' });
  actionSports.push({ sport: 'mlb' });
  actionSports.push({ sport: 'nhl' });
  actionSports.push({ sport: 'soccer' });
  actionSports.push({ sport: 'pga' });
  actionSports.push({ sport: 'boxing' });
  const method = 'get';
  const options = { method, url: apiUrl, timeout: 2000 };
  try {
    const requests = [];
    const actionBaseUrl = 'https://api.actionnetwork.com/web/v1/scoreboard';
    actionSports.forEach((actionSport: actionNetworkRequest) => {
      const url = `${actionBaseUrl}/${actionSport.sport}`;
      const params = actionSports.params;
      requests.push(axios.get(url, { params }));
    });

    Promise.all(requests).then(async responses => {
      const allEvents = [];
      responses.forEach(response => {
        const events = response.data.games ? response.data.games : response.data.competitions;
        allEvents.push(...events);
      });
      console.log('await...');
      await createAll(allEvents);
      return respond(200);
    });
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
});

async function createAll(events: any[]) {
  const tableGame = process.env.tableGame;
  const docClient = new AWS.DynamoDB.DocumentClient();
  const dbEvents = [];
  events.forEach(event => {
    event.network = event.broadcast ? event.broadcast.network : null;
    console.log(event.network, event.start_time);
    dbEvents.push({
      PutRequest: {
        Item: event,
      },
    });
  });

  const params = {
    RequestItems: {
      [tableGame]: dbEvents,
    },
  };

  try {
    const result = await docClient.batchWrite(params).promise();
    console.log({ result });
  } catch (e) {
    console.error(e);
  }
}

module.exports.transformSIUrl = transformSIUrl;
module.exports.transformGame = transformGame;
