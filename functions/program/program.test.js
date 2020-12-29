const moment = require('moment');
const {
  build,
  generateId,
  getLocalChannelName,
  getChannels,
  getChannelsWithMinor,
  transformSIUrl,
  getDefaultRating,
  getProgramListTiebreaker,
  combineByProgrammingId,
} = require('./program');
const data = require('../.resources/old/channelschedule-2.json');
const file = require('./program');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});

test('combineByProgrammingId combines programs by programming id and start time', () => {
  const programs = [
    { channel: 'FS1', programmingId: '1', start: 100 },
    { channel: 'ABC', programmingId: '3', start: 100 }, // combine
    { channel: 'FOX', programmingId: '2', start: 100 },
    { channel: 'ESPN', programmingId: '3', start: 100 }, // combine
    { channel: 'ESPN2', programmingId: '3', start: 900 },
  ];

  const result = combineByProgrammingId(programs);
  expect(result.length).toEqual(4);
  expect(result[0].channelTitle).toEqual('FS1');
  expect(result[1].channelTitle).toEqual('FOX');
  expect(result[2].channelTitle).toEqual('ABC, ESPN');
  expect(result[3].channelTitle).toEqual('ESPN2');
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
  const programmingId = 'EP830475';
  const programFSN = { channel: 661, programmingId };
  const programLocal = { channel: 9, programmingId };
  const programMLB = { channel: 213, programmingId };
  const programFS1 = { channel: 213, programmingId };
  const programNFLTicket = { channel: 703, programmingId };
  const programNFLNetwork = { channel: 212, programmingId };
  const programNFLNetworkDifferent = { channel: 212, programmingId: 'EP09384' };
  const programMLBDifferent = { channel: 212, programmingId: 'EP87453' };

  test('choose FSN over MLB (local market game)', () => {
    const result = getProgramListTiebreaker([programMLB, programFSN]);
    console.log({ result });
    expect(result[0].channel).toEqual(programFSN.channel);
  });
  test('choose local over NFL Ticket (local market game)', () => {
    const result = getProgramListTiebreaker([programNFLTicket, programLocal]);
    expect(result[0].channel).toEqual(programLocal.channel);
  });
  test('choose local over NFLN (thursday night football)', () => {
    const result = getProgramListTiebreaker([programNFLNetwork, programLocal]);
    expect(result[0].channel).toEqual(programLocal.channel);
  });
  test('choose local over FSN (opening day)', () => {
    const result = getProgramListTiebreaker([programFSN, programLocal]);
    expect(result[0].channel).toEqual(programLocal.channel);
  });
  test('choose FSN over FS1 (reds sometimes)', () => {
    const result = getProgramListTiebreaker([programFS1, programFSN]);
    expect(result[0].channel).toEqual(programFSN.channel);
  });
  // test('choose program in progress over program out of time slot', () => { // fixed with query
  //   programFS1.start = moment.subtract(40, 'm').unix();
  //   programFS1.end = moment.add(20, 'm').unix();
  //   programFSN.start = moment.subtract(2, 'h').unix();
  //   programFSN.end = moment.subtract(1, 'h').unix();
  //   const result = getProgramListTiebreaker([programFS1, programFSN]);
  //   expect(result[0].channel).toEqual(programFS1.channel);
  // });
  test('removes duplicates by programmingId', () => {
    const otherProgram = programLocal;
    otherProgram.programmingId = 'EP888';
    const result = getProgramListTiebreaker([programFS1, programFSN, otherProgram]);
    expect(result.length).toEqual(2);
    expect(result[0].channel).toEqual(programFSN.channel);
    expect(result[1].channel).toEqual(otherProgram.channel);
  });
  test('leaves alone when not duplicate progammingIds', () => {
    const result = getProgramListTiebreaker([
      programNFLNetworkDifferent,
      programMLBDifferent,
      programNFLNetwork,
      programNFLNetwork,
    ]);
    expect(result.length).toEqual(3);
    expect(result[0].channel).toEqual(programNFLNetworkDifferent.channel);
    expect(result[1].channel).toEqual(programMLBDifferent.channel);
    expect(result[2].channel).toEqual(programNFLNetwork.channel);
  });
});
