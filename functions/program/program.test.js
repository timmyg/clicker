require('dotenv').config({ path: '../.env.example' });
const moment = require('moment');
const { build, generateId, getLocalChannelName, getChannels, getChannelsWithMinor } = require('./program');
const data = require('../.resources/old/channelschedule-2.json');
const file = require('./program');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});

test('generateId generates the same id when same program', () => {
  const program = {
    chNum: 206,
    airTime: moment().toDate(),
  };
  const program1Id = generateId(program);
  const program2Id = generateId(program);
  expect(program1Id).toEqual(program2Id);
});

test('generateId generates different ids when different programs', () => {
  const zip1 = '45212';
  const zip2 = '45202';
  const program1 = {
    chNum: 206,
    zip: zip1,
  };
  const program2 = {
    chNum: 206,
    zip: zip2,
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
  expect(response[0]).toHaveProperty('id');
  expect(response.length).toBe(129);
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
