require('dotenv').config({ path: '../.env.example' });
const { getGameStatus, transformSIUrl } = require('./game');

test('transformSIUrl', () => {
  expect(transformSIUrl('https://www.si.com/nfl/game/2142137')).toEqual(
    'https://stats.api.si.com/v1/nfl/game_detail?id=2142137',
  );
  expect(transformSIUrl('https://www.si.com/college-football/game/2126203')).toEqual(
    'https://stats.api.si.com/v1/ncaaf/game_detail?id=2126203',
  );
});

describe.skip('getGameStatus', () => {
  describe('correctly identifies active, blowout game', () => {
    test('football', () => {
      const data = require('../.resources/games/mlb-upcoming.json');
      const { ended, blowout } = getGameStatus(data);
      expect(ended).toBeFalsy();
      expect(ended).toBeTruthy();
    });
    test('baseball', () => {
      const data = require('../.resources/games/mlb-upcoming.json');
      const { ended, blowout } = getGameStatus(data);
      expect(ended).toBeFalsy();
      expect(ended).toBeTruthy();
    });
    test('basketball', () => {
      const data = require('../.resources/games/mlb-upcoming.json');
      const { ended, blowout } = getGameStatus(data);
      expect(ended).toBeFalsy();
      expect(ended).toBeTruthy();
    });
  });

  test('correctly identifies ended game', () => {
    const data = require('../.resources/games/mlb-upcoming.json');
    const { ended, blowout } = getGameStatus(data);
    expect(ended).toBeFalsy();
    expect(ended).toBeTruthy();
  });

  test('correctly identifies ended, non-blowout game', () => {
    const data = require('../.resources/games/mlb-upcoming.json');
    const { ended, blowout } = getGameStatus(data);
    expect(ended).toBeFalsy();
    expect(ended).toBeTruthy();
  });
});
