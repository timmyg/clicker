const file = require('./location');
const { ControlCenterProgram, getAvailableBoxes, filterProgramsAlreadyShowing } = require('./location');
const moment = require('moment');

test('smoke test', () => {
  const response = file.health();
  expect(response).toBeTruthy;
});

test('ControlCenterProgram model', () => {
  const objects = [
    {
      fields: {
        start: moment()
          .add(15, 'm')
          .toDate(),
      },
    },
    {
      fields: {
        start: moment()
          .add(15, 'm')
          .toDate(),
      },
    },
  ];
  const ccPrograms = objects.map(p => new ControlCenterProgram(p));
  expect(ccPrograms[0].isMinutesFromNow(10)).toBeFalsy();
  expect(ccPrograms[0].isMinutesFromNow(20)).toBeTruthy();
});

describe('filterProgramsAlreadyShowing', () => {
  const ccPrograms = [
    { fields: { channel: 206 } }, // showing
    { fields: { channel: 209 } },
    { fields: { channel: 219 } }, // showing
    { fields: { channel: 5 } },
  ];
  const boxes = [{ channel: 206 }, { channel: 219 }, { channel: 206 }, { channel: 9 }];
  const result = filterProgramsAlreadyShowing(ccPrograms, boxes);
  expect(result.length).toBe(2);
});
describe('getAvailableBoxes', () => {
  test.skip("removes boxes that shouldn't be changed", () => {
    const openGoodBox = { id: 1, zone: '4' };
    const openGoodBox2 = { id: 2, zone: '3' };
    const reservedManuallyChangedRecently = {
      id: 3,
      zone: 'A',
      channelSource: 'manual',
      channelChangeAt: moment()
        .subtract(33, 'm')
        .unix(),
    };
    const reservedManuallyChangedGameOn = {
      id: 4,
      zone: '15',
      channelSource: 'manual',
      channelChangeAt: moment()
        .subtract(50, 'm')
        .unix(),
      program: {
        game: {
          start: moment()
            .subtract(55, 'm')
            .unix(),
          liveStatus: {
            status: 'inprogress',
          },
        },
      },
    };
    // TODO
    const openManuallyChangedGameOver = {
      id: 5,
      zone: '15',
      channelSource: 'manual',
      channelChangeAt: moment()
        .subtract(50, 'm')
        .unix(),
    };
    const openManuallyChangedProgramOver = {
      id: 6,
      zone: '15',
      channelSource: 'manual',
      channelChangeAt: moment()
        .subtract(40, 'm')
        .unix(),
      program: {
        start: moment()
          .subtract(30, 'm')
          .unix(),
      },
    };
    const reservedZonelessBox = { id: 57, zone: '' };
    const boxes = [
      openGoodBox,
      openGoodBox2,
      reservedManuallyChangedRecently,
      reservedManuallyChangedGameOn,
      openManuallyChangedGameOver,
      openManuallyChangedProgramOver,
      reservedZonelessBox,
    ];
    const result = getAvailableBoxes(boxes);
    expect(result.length).toBe(4);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(5);
    expect(result[3].id).toBe(6);
  });
});
