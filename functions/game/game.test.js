const { getInProgressAndCompletedGames, buildStatus, transformGame, transformSIUrl } = require('./game');

describe('transformGame', () => {
  describe('getInProgressAndCompletedGames', () => {
    test('gets only in-progress games', () => {
      const data = require('../.resources/action-network/games-in-progress.json');
      const result = getInProgressAndCompletedGames(data);
      expect(result.length).toBe(37);
    });
  });
});

describe('transformGame', () => {
  test('ncaa football', () => {
    const data = require('../.resources/action-network/game.json');
    const result = transformGame(data);
    expect(result.id).toBe(69504);
    expect(result.start).toBe('2019-11-01T00:00:00.000Z');
    expect(result.leagueName).toBe('ncaaf');
    expect(result.status).toBe('complete');
    expect(result.scoreboard.clock).toBe('00:00');
    expect(result.scoreboard.period).toBe(4);
    expect(result.broadcast.network).toBe('P12');
    expect(result.book.total).toBe(56);
    expect(result.home.score).toBe(17);
    expect(result.home.name.full).toBe('Baylor Bears');
    expect(result.home.name.short).toBe('Bears');
    expect(result.home.name.abbr).toBe('BAY');
    expect(result.home.name.display).toBe('Baylor');
    expect(result.home.logo).toBe('https://static.sprtactn.co/teamlogos/ncaaf/100/bay.png');
    expect(result.home.rank).toBe(12);
    expect(result.home.book.moneyline).toBe('-850');
    expect(result.home.book.spread).toBe('-18');
    expect(result.away.score).toBe(14);
    expect(result.away.name.full).toBe('West Virginia Mountaineers');
    expect(result.away.name.short).toBe('Mountaineers');
    expect(result.away.name.abbr).toBe('WVU');
    expect(result.away.name.display).toBe('West Virginia');
    expect(result.away.logo).toBe('https://static.sprtactn.co/teamlogos/ncaaf/100/wvu.png');
    expect(result.away.rank).toBeFalsy();
    expect(result.away.book.moneyline).toBe('+575');
    expect(result.away.book.spread).toBe('+18');
  });
});
describe('get status', () => {
  describe('nfl', () => {
    test('completed', () => {
      const data = require('../.resources/db/games/football/nfl/completed.json');
      const { started, blowout, ended, description } = buildStatus(data);
      expect(description).toBe('Final');
      expect(started).toBeTruthy();
      expect(ended).toBeTruthy();
      expect(blowout).toBeFalsy();
    });
    test('blowout', () => {
      const data = require('../.resources/db/games/football/nfl/blowout.json');
      const { started, blowout, ended, description } = buildStatus(data);
      expect(description).toBe('In Progress');
      expect(started).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(blowout).toBeTruthy();
    });
    test('close game', () => {
      const data = require('../.resources/db/games/football/nfl/close-game.json');
      const { started, blowout, ended, description } = buildStatus(data);
      expect(description).toBe('In Progress');
      expect(started).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(blowout).toBeFalsy();
    });
    test('early blowout', () => {
      const data = require('../.resources/db/games/football/nfl/early-blowout.json');
      const { started, blowout, ended, description } = buildStatus(data);
      expect(description).toBe('In Progress');
      expect(started).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(blowout).toBeFalsy();
    });
    test('future', () => {
      const data = require('../.resources/db/games/football/nfl/future.json');
      const { started, blowout, ended, description } = buildStatus(data);
      // expect(description).toBe('CAR 0 @ ATL 0 (12/8 1:00pm EST)');
      expect(started).toBeFalsy();
      expect(ended).toBeFalsy();
      expect(blowout).toBeFalsy();
    });
  });
  describe('la ligue', () => {
    test('close game', () => {
      const data = require('../.resources/db/games/soccer/la-ligue/close-game.json');
      const { started, blowout, ended, description } = buildStatus(data);
      expect(description).toBe("81'");
      expect(started).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(blowout).toBeFalsy();
    });
    test('blowout', () => {
      const data = require('../.resources/db/games/soccer/la-ligue/blowout.json');
      const { started, blowout, ended, description } = buildStatus(data);
      expect(description).toBe("81'");
      expect(started).toBeTruthy();
      expect(ended).toBeFalsy();
      expect(blowout).toBeTruthy();
    });
  });
});
