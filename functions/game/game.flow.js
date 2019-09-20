// @flow
const axios = require('axios');
const { respond, invokeFunctionSync, getPathParameters, getBody } = require('serverless-helpers');
require('dotenv').config();

class SiLeague {
  name: string; // Major League Baseball, College Football
  abbreviation: string; // MLB, NCAAF
}

class SiTeam {
  title: string; // Iowa State Cyclones
  score: number; // 17
  is_winner: boolean; // false
}

class SiStatus {
  period: {
    name: string, // 4th
    unit: string, // Quarter
  };
  inning: number; // 1
  name: string; // Final, Pre-Game
  is_active: boolean; // false
  inning_division: string; // "Top"
}

class SiGame {
  tv: string;
  status: {};
  teams: SiTeam[];
  league: SiLeague;
}

class SiResult {
  status: string;
  data: any;
}

class GameStatus {
  ended: boolean;
  blowout: boolean;
  description: string;
}

module.exports.getGameStatus = async (event: any) => {
  console.log('getGameStatus');
  const { url: webUrl } = getBody(event);
  const apiUrl = transformSIUrl(webUrl);

  const method = 'get';
  const options = { method, url: apiUrl };
  console.log({ options });
  const result = await axios(options);
  console.log({ result });
  const gameStatus: GameStatus = getGameStatus(result.data);
  console.log({ gameStatus });

  return respond(200, gameStatus);
};

function getGameStatus(result: SiResult): GameStatus {
  const siGame: SiGame = result.data;
  const gameStatus = new GameStatus();
  // check if game has ended

  gameStatus.ended = true;
  gameStatus.blowout = false;
  gameStatus.description = 'USC 40, UCLA 11 - 3rd quarter 12:44';
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
