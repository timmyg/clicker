const moment = require('moment');
const {
  build,
  generateId,
  getLocalChannelName,
  getChannels,
  getChannelsWithMinor,
  transformSIUrl,
  getDefaultRating,
  getProgramTiebreaker,
} = require('./program');
const data = require('../.resources/old/channelschedule-2.json');
const file = require('./program');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});

test('generateId generates the same id when same program', () => {
  const region1 = 'cincinnati';
  const program = {
    channel: 206,
    start: moment().toDate(),
    programmingId: 'ep1',
  };
  const program1Id = generateId(program);
  const program2Id = generateId(program);
  expect(program1Id).toEqual(program2Id);
});

test('generateId generates different ids when different times', () => {
  const program1 = {
    channel: 206,
    start: 20000000,
    programmingId: 'ep1',
  };
  const program2 = {
    channel: 206,
    start: 20000001,
    programmingId: 'ep1',
  };
  const program1Id = generateId(program1);
  const program2Id = generateId(program2);
  expect(program1Id).not.toEqual(program2Id);
});

test('generateId generates different ids when different channels', () => {
  const program1 = {
    channel: 206,
    start: 20000000,
    programmingId: 'ep1',
  };
  const program2 = {
    channel: 12,
    start: 20000000,
    programmingId: 'ep1',
  };
  const program1Id = generateId(program1);
  const program2Id = generateId(program2);
  expect(program1Id).not.toEqual(program2Id);
});

test('build programs', () => {
  // fix dates
  data.schedule.forEach((s, i) => {
    s.schedules.forEach((c, i, channels) => {});
  });
  const response = build(data.schedule, 'cincinnati');
  // console.log({ response });
  expect(response[0]).toHaveProperty('region');
  expect(response[0]).toHaveProperty('start');
  expect(response[0]).toHaveProperty('end');
  expect(response.length).toBe(190);
});

test('convert local channel names', () => {
  expect(getLocalChannelName('Cincinnati, OH WCPO ABC 9 SD')).toBe('ABC');
  expect(getLocalChannelName('Cincinnati, OH WLWT NBC 5 SD')).toBe('NBC');
  expect(getLocalChannelName('Cincinnati, OH WKRC CBS 12 SD')).toBe('CBS');
  expect(getLocalChannelName('Cincinnati, OH WXIX FOX 19 SD')).toBe('FOX');
  expect(getLocalChannelName('Cincinnati Blah blah')).toBe(undefined);
});

const channels = [5, 9, 12, 19, 661.1];

test('getMajorChannels', () => {
  expect(getChannels(channels)).toEqual([5, 9, 12, 19, 661]);
});

describe('getDefaultRating', () => {
  test('rated', () => {
    expect(getDefaultRating({ title: 'SportsCenter With Scott Van Pelt' })).toEqual(2);
  });
  test('rated ignore', () => {
    expect(getDefaultRating({ title: 'The Best of This is SportsCenter' })).toEqual(undefined);
  });
  test('unrated', () => {
    expect(getDefaultRating({ title: 'Winter X Games' })).toEqual(undefined);
  });
});

describe('getProgramTiebreaker', () => {
  const programFSN = { live: { channel: 661 } };
  const programLocal = { live: { channel: 9 } };
  const programMLB = { live: { channel: 213 } };
  const programNFLTicket = { live: { channel: 703 } };
  const programNFLNetwork = { live: { channel: 212 } };

  test('choose FSN over MLB (local market game)', () => {
    expect(getProgramTiebreaker([programMLB, programFSN]).live.channel).toEqual(programFSN.live.channel);
  });
  test('choose local over NFL Ticket (local market game)', () => {
    expect(getProgramTiebreaker([programLocal, programNFLTicket]).live.channel).toEqual(programLocal.live.channel);
  });
  test('choose local over NFLN (thursday night football)', () => {
    expect(getProgramTiebreaker([programLocal, programNFLNetwork]).live.channel).toEqual(programLocal.live.channel);
  });
  test('choose local over FSN (opening day)', () => {
    expect(getProgramTiebreaker([programFSN, programLocal]).live.channel).toEqual(programLocal.live.channel);
  });
});
