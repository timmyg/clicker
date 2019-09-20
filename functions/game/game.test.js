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
    test('ncaa football', () => {
      const data = require('../.resources/games/ncaaf-in-progress.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('description here');
    });
    test('ncaa football', () => {
      const data = require('../.resources/games/ncaaf-complete.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('description here');
    });
    test('nfl football', () => {
      const data = require('../.resources/games/nfl-complete.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('description here');
    });
    test('mlb', () => {
      const data = require('../.resources/games/mlb-upcoming.json');
      const { started, blowout, ended, description } = transformGame(data);
      expect(started).toBeTruthy();
      expect(blowout).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(description).toBe('description here');
    });
  });

  describe('correctly identifies active, non-blowout game', () => {});
  describe('correctly identifies completed game', () => {});
  describe('correctly identifies upcoming game', () => {});
});
