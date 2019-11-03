// @flow
const axios = require('axios');
const AWS = require('aws-sdk');
const { respond, getPathParameters, getBody, Raven, RavenLambdaWrapper } = require('serverless-helpers');

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

module.exports.sync = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('sync');
  const apiUrl = 'https://api.actionnetwork.com/web/v1/scoreboard/nfl?bookIds=30,15';
  const method = 'get';
  const options = { method, url: apiUrl, timeout: 2000 };
  try {
    const { data } = await axios(options);
    console.log({ data });
    const { games } = data;
    await createGames(games);
    return respond(200);
  } catch (e) {
    console.error(e);
  }
});

async function createGames(games: any[]) {
  const tableGame = process.env.tableGame;
  const docClient = new AWS.DynamoDB.DocumentClient();
  const dbGames = [];
  games.forEach(game => {
    game.network = game.broadcast.network;
    dbGames.push({
      PutRequest: {
        Item: game,
      },
    });
  });
  console.log({ dbGames });

  const params = {
    RequestItems: {
      [tableGame]: dbGames,
    },
  };
  console.log({ params });

  try {
    const x = await docClient.batchWrite(params).promise();
    console.log({ x });
  } catch (e) {
    console.error(e);
  }
}

module.exports.transformSIUrl = transformSIUrl;
module.exports.transformGame = transformGame;
