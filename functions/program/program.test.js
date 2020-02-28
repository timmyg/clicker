const moment = require('moment');
const {
  build,
  generateId,
  getLocalChannelName,
  getChannels,
  getChannelsWithMinor,
  transformSIUrl,
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
  const response = build(data.schedule, null, ['324', '661-1']);
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
