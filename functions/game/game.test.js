require('dotenv').config({ path: '../.env.example' });
const { transformGame, transformSIUrl } = require('./game');

test('transformSIUrl', () => {
  expect(transformSIUrl('https://www.si.com/nfl/game/2142137')).toEqual(
    'https://stats.api.si.com/v1/nfl/game_detail?id=2142137',
  );
  expect(transformSIUrl('https://www.si.com/college-football/game/2126203')).toEqual(
    'https://stats.api.si.com/v1/ncaaf/game_detail?id=2126203',
  );
});

describe('transformGame', () => {
  describe('correctly identifies active, blowout game', () => {
    test('nba', () => {
      const data = require('../.resources/games/blowout/nba.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Hou 103 @ Uta 74 (5:51 4th)');
    });
    test('ncaa football', () => {
      const data = require('../.resources/games/blowout/ncaaf.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Hou 21 @ Tulane 38 (2:18 4th)');
    });
    test('nfl', () => {
      const data = require('../.resources/games/blowout/nfl.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Ten 22 @ Jax 0 (4:22 4th)');
    });
    test('mlb', () => {
      const data = require('../.resources/games/blowout/mlb.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('NYM 0 @ Col 7 (Bottom 8)');
    });
    test('nhl', () => {
      const data = require('../.resources/games/blowout/nhl.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Det 2 @ Mon 5 (7:20 3rd)');
    });
    test('wnba', () => {
      const data = require('../.resources/games/blowout/wnba.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Con 94 @ Was 62 (5:55 4th)');
    });
    test('soccer: premier league', () => {
      // https://stats.api.si.com/v1/soccer/game_detail?league=epl&id=2146651&box_score=true&play_by_play=true&add_records=true&roster=true
      // https://www.si.com/epl/game/2146651/live
      const data = require('../.resources/games/blowout/epl.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('BOU 4 @ ARS 1 (83:41 2nd)');
    });
    test.skip('soccer: la liga', () => {});
  });

  describe('correctly identifies active, non-blowout game', () => {
    test('nba', () => {
      const data = require('../.resources/games/in-progress/nba.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Hou 103 @ Uta 74 (11:51 4th)');
    });
    test('ncaa football', () => {
      const data = require('../.resources/games/in-progress/ncaaf.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Hou 28 @ Tulane 31 (2:18 4th)');
    });
    test('nfl', () => {
      const data = require('../.resources/games/in-progress/nfl.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Ten 22 @ Jax 0 (4:22 2nd)');
    });
    test('mlb', () => {
      const data = require('../.resources/games/in-progress/mlb.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('NYM 5 @ Col 7 (Bottom 8)');
    });
  });
  describe('correctly identifies completed game', () => {
    test('nba', () => {
      const data = require('../.resources/games/over/nba.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeTruthy();
      expect(description).toBe('Hou 83 @ Uta 74 (Final)');
    });
    test('ncaa football', () => {
      const data = require('../.resources/games/over/ncaaf.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeTruthy();
      expect(description).toBe('Iowa 18 @ IaSt 17 (Final)');
    });
    test('nfl', () => {
      const data = require('../.resources/games/over/nfl.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeTruthy();
      expect(description).toBe('Cle 23 @ NYJ 3 (Final)');
    });
    test('mlb', () => {
      const data = require('../.resources/games/over/mlb.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeTruthy();
      expect(description).toBe('NYM 2 @ Col 4 (Final)');
    });
  });
  describe('correctly identifies upcoming game', () => {
    test('nba', () => {
      const data = require('../.resources/games/upcoming/nba.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeFalsy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Hou 83 @ Uta 74 (Pre-Game)');
    });
    test('ncaa football', () => {
      const data = require('../.resources/games/upcoming/ncaaf.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeFalsy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Iowa 18 @ IaSt 17 (Pre-Game)');
    });
    test('nfl', () => {
      const data = require('../.resources/games/upcoming/nfl.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeFalsy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('Cle 23 @ NYJ 3 (Pre-Game)');
    });
    test('mlb', () => {
      const data = require('../.resources/games/upcoming/mlb.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeFalsy();
      expect(blowout).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(description).toBe('LAA 0 @ NYY 0 (Pre-Game)');
    });
  });
});
