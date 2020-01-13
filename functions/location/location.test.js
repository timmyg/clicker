const file = require('./location');
const { ControlCenterProgram, getAvailableBoxes, filterProgramsAlreadyShowing, createBoxes } = require('./location');
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
describe('get boxes', () => {
  const openGoodBox = { id: 1, zone: '4' };
  const openGoodBox2 = { id: 2, zone: '3' };
  const reservedManuallyChangedRecently = {
    id: 3,
    zone: 'A',
    program: {
      clickerRating: 7,
    },
    channelSource: 'manual',
    channelChangeAt:
      moment()
        .subtract(27, 'm')
        .unix() * 1000,
  };
  const reservedManuallyChangedGameOn = {
    id: 4,
    zone: '15',
    channelSource: 'manual',
    channelChangeAt:
      moment()
        .subtract(50, 'm')
        .unix() * 1000,
    program: {
      start:
        moment()
          .subtract(40, 'm')
          .unix() * 1000,
      game: {
        liveStatus: {
          status: 'inprogress',
        },
      },
    },
  };
  const openManuallyChangedDifferentProgram = {
    id: 5,
    zone: '15',
    channelSource: 'manual',
    channelChangeAt:
      moment()
        .subtract(2, 'h')
        .unix() * 1000,
    program: {
      start:
        moment()
          .subtract(1, 'h')
          .unix() * 1000,
      game: {
        liveStatus: {
          status: 'complete',
        },
      },
    },
  };
  const reservedManuallyChangedProgramOver = {
    id: 6,
    zone: '15',
    channelSource: 'manual',
    channelChangeAt:
      moment()
        .subtract(40, 'm')
        .unix() * 1000,
    program: {
      start:
        moment()
          .subtract(2, 'h')
          .unix() * 1000,
      game: {
        status: 'complete',
      },
    },
  };
  const reservedZonelessBox = { id: 7, zone: '' };
  test('createBoxes: map to new object', () => {
    const result = createBoxes([
      reservedManuallyChangedRecently,
      openManuallyChangedDifferentProgram,
      reservedManuallyChangedGameOn,
    ]);

    expect(result.length).toBe(3);

    const [one, two, three] = result;
    expect(one.hasProgram).toBeTruthy();
    expect(one.ended).toBeFalsy();
    expect(one.blowout).toBeFalsy();
    expect(one.rating).toBe(7);
    expect(one.box.id).toBe(3);
  });
  describe("getAvailableBoxes: removes boxes that shouldn't be changed", () => {
    test('openGoodBox', () => {
      const result = getAvailableBoxes([openGoodBox]);
      expect(result.length).toBe(1);
    });
    test('openGoodBox2', () => {
      const result = getAvailableBoxes([openGoodBox2]);
      expect(result.length).toBe(1);
    });
    test('openManuallyChangedDifferentProgram', () => {
      const result = getAvailableBoxes([openManuallyChangedDifferentProgram]);
      expect(result.length).toBe(1);
    });
    test('reservedManuallyChangedProgramOver', () => {
      const result = getAvailableBoxes([reservedManuallyChangedProgramOver]);
      expect(result.length).toBe(0);
    });
    test('reservedManuallyChangedRecently', () => {
      const result = getAvailableBoxes([reservedManuallyChangedRecently]);
      expect(result.length).toBe(0);
    });
    test('reservedManuallyChangedGameOn', () => {
      const result = getAvailableBoxes([reservedManuallyChangedGameOn]);
      expect(result.length).toBe(0);
    });
    test('reservedZonelessBox', () => {
      const result = getAvailableBoxes([reservedZonelessBox]);
      expect(result.length).toBe(0);
    });
    test('all of em', () => {
      const result = getAvailableBoxes([
        openGoodBox,
        openGoodBox2,
        openManuallyChangedDifferentProgram,
        reservedManuallyChangedProgramOver,
        reservedManuallyChangedRecently,
        reservedManuallyChangedGameOn,
        reservedZonelessBox,
      ]);
      expect(result.length).toBe(3);
      expect(result[0].box.id).toBe(1);
      expect(result[1].box.id).toBe(2);
      expect(result[2].box.id).toBe(5);
    });
  });
});
