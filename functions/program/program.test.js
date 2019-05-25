require('dotenv').config({ path: '../.env.example' });
const moment = require('moment');
const { build, generateId } = require('./program');
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
  const date1 = moment().toDate();
  const date2 = moment()
    .add(30, 'm')
    .toDate();
  const program1 = {
    chNum: 206,
    airTime: date1,
  };
  const program2 = {
    chNum: 206,
    airTime: date2,
  };
  const program1Id = generateId(program1);
  const program2Id = generateId(program2);
  expect(program1Id).not.toEqual(program2Id);
});

test('build programs', () => {
  // fix dates
  data.schedule.forEach((s, i) => {
    // console.log(s);
    s.schedules.forEach((c, i, channels) => {
      // console.log({ c });
      // channels[i]['airTime'] = moment().toDate();
      // channels[i]['end'] = moment()
      //   .add(1, 'h')
      //   .toDate();
      // console.log(channels[i]);
    });
  });
  const response = build(data.schedule);
  // console.log({ response });
  expect(response[0]).toHaveProperty('id');
  expect(response.length).toBe(183);
});
