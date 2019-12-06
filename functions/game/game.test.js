const { getInProgressAndCompletedGames, transformGame, transformGameV2, transformSIUrl } = require('./game');

describe('transformSIUrl', () => {
	test('nfl', () => {
		expect(transformSIUrl('https://www.si.com/nfl/game/2142137')).toEqual(
			'https://stats.api.si.com/v1/nfl/game_detail?id=2142137'
		);
	});
	test('ncaab', () => {
		expect(transformSIUrl('https://www.si.com/college-basketball/game/2188784')).toEqual(
			'https://stats.api.si.com/v1/ncaab/game_detail?id=2188784'
		);
	});
	test('ncaaf', () => {
		expect(transformSIUrl('https://www.si.com/college-football/game/2126203')).toEqual(
			'https://stats.api.si.com/v1/ncaaf/game_detail?id=2126203'
		);
	});
	test('serie-a', () => {
		expect(transformSIUrl('https://www.si.com/serie-a/game/2170270')).toEqual(
			'https://stats.api.si.com/v1/soccer/game_detail?id=2170270&league=serie-a'
		);
	});
	test('la liga', () => {
		expect(transformSIUrl('https://www.si.com/la-liga/game/2170270')).toEqual(
			'https://stats.api.si.com/v1/soccer/game_detail?id=2170270&league=la-liga'
		);
	});
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
			expect(description).toBe('Atl 0 @ Det 0 (Pre-Game)');
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
	describe('getInProgressAndCompletedGames', () => {
		test('gets only in-progress games', () => {
			const data = require('../.resources/action-network/games-in-progress.json');
			const result = getInProgressAndCompletedGames(data);
			expect(result.length).toBe(37);
		});
	});
});

describe('transformGameV2', () => {
	test('ncaa football', () => {
		const data = require('../.resources/action-network/game.json');
		const result = transformGameV2(data);
		expect(result.id).toBe(69504);
		expect(result.start).toBe('2019-11-01T00:00:00.000Z');
		expect(result.leagueName).toBe('ncaaf');
		expect(result.status).toBe('complete');
		expect(result.scoreboard.clock).toBe('00:00');
		expect(result.scoreboard.period).toBe(4);
		expect(result.broadcast.network).toBe('ESPN');
		expect(result.book.total).toBe(56);
		expect(result.home.score).toBe(17);
		expect(result.home.name.full).toBe('Baylor Bears');
		expect(result.home.name.short).toBe('Bears');
		expect(result.home.name.abbr).toBe('BAY');
		expect(result.home.name.display).toBe('Baylor');
		expect(result.home.logo).toBe('https://static.sprtactn.co/teamlogos/ncaaf/100/bay.png');
		expect(result.home.rank).toBe(12);
		expect(result.home.book.moneyline).toBe(-850);
		expect(result.home.book.spread).toBe(-18);
		expect(result.away.score).toBe(14);
		expect(result.away.name.full).toBe('West Virginia Mountaineers');
		expect(result.away.name.short).toBe('Mountaineers');
		expect(result.away.name.abbr).toBe('WVU');
		expect(result.away.name.display).toBe('West Virginia');
		expect(result.away.logo).toBe('https://static.sprtactn.co/teamlogos/ncaaf/100/wvu.png');
		expect(result.away.rank).toBeFalsy();
		expect(result.away.book.moneyline).toBe(575);
		expect(result.away.book.spread).toBe(18);
	});
});
