// @flow
const axios = require('axios');
const { respond, getPathParameters, getBody, Raven, RavenLambdaWrapper } = require('serverless-helpers');
require('dotenv').config();

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
  const { url: webUrl } = getBody(event);
  const apiUrl = transformSIUrl(webUrl);

  const method = 'get';
  const options = { method, url: apiUrl };
  console.log({ apiUrl });
  const result = await axios(options);
  const gameStatus: GameStatus = transformGame(result.data);

  return respond(200, gameStatus);
});

function transformGame(result: SiResult): GameStatus {
  const game = result.data;
  const gameStatus = new GameStatus();
  const { name: status } = game.status;

  console.log({ status });
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
      console.log('NCAAF!!!!', homeTeam.score, awayTeam.score);
      if (isNearEnd && isBlowout) {
        gameStatus.blowout = true;
      }
    } else if (leageAbbreviation === 'NFL') {
      // 6:00 left in 4th quarter and 17+ point difference
      const isNearEnd = game.status.period.id === 4 && +game.status.period.time.split(':')[0] <= 6;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 17;
      if (isNearEnd && isBlowout) {
        gameStatus.blowout = true;
      }
    } else if (leageAbbreviation === 'MLB') {
      // 8th inning and 5+ run difference
      const isNearEnd = game.status.inning >= 8;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 5;
      if (isNearEnd && isBlowout) {
        gameStatus.blowout = true;
      }
    } else if (leageAbbreviation === 'NCAAB') {
      // 8:00 left in 2nd half and 20+ point difference
      const isNearEnd = game.status.period.id === 2 && +game.status.period.time.split(':')[0] <= 8;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 20;
      if (isNearEnd && isBlowout) {
        gameStatus.blowout = true;
      }
    } else if (leageAbbreviation === 'NBA') {
      // 6:00 left in 4th quarter and 25+ point difference
      const isNearEnd = game.status.period.id === 4 && +game.status.period.time.split(':')[0] <= 6;
      const isBlowout = Math.abs(homeTeam.score - awayTeam.score) >= 25;
      if (isNearEnd && isBlowout) {
        gameStatus.blowout = true;
      }
    }
  }

  // set description
  gameStatus.description = `${awayTeam.abbreviation} ${awayTeam.score} @ ${homeTeam.abbreviation} ${homeTeam.score}`;
  if (status === 'In-Progress') {
    if (['NFL', 'NCAAF', 'NCAAB', 'NBA'].includes(leageAbbreviation)) {
      gameStatus.description += ` (${game.status.period.time} ${game.status.period.name})`;
    } else if (['MLB'].includes(leageAbbreviation)) {
      gameStatus.description += ` (${game.status.inning_division} ${game.status.inning})`;
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
  apiUrl.push(sport);
  apiUrl.push(`game_detail?id=${urlParts[5]}`);
  return apiUrl.join('/');
}

module.exports.transformSIUrl = transformSIUrl;
module.exports.transformGame = transformGame;
