const { build, generateId, transformPrograms } = require('./program');
const data = require('../resources/channelschedule-2.json');

test('generateId generates the same id when same program', () => {
  const program = {
    chNum: 206,
    airTime: '2019-02-09T23:00:00.000+0000',
  };
  const program1Id = generateId(program);
  const program2Id = generateId(program);
  expect(program1Id).toEqual(program2Id);
});

test('generateId generates different ids when different programs', () => {
  const program1 = {
    chNum: 206,
    airTime: '2019-02-09T23:00:00.000+0000',
  };
  const program2 = {
    chNum: 206,
    airTime: '2019-02-09T23:30:00.000+0000',
  };
  const program1Id = generateId(program1);
  const program2Id = generateId(program2);
  expect(program1Id).not.toEqual(program2Id);
});

test('build programs', () => {
  const response = build(data.schedule);
  expect(response[0]).toHaveProperty('id');
  expect(response.length).toBe(183);
});
