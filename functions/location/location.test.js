const file = require('./location');
const { ControlCenterProgram, getAvailableBoxes, filterPrograms } = require('./location');
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

describe('filterPrograms', () => {
  test('already showing', () => {
    const ccPrograms = [
      { fields: { channel: 206, rating: 9 } }, // showing
      { fields: { channel: 209, rating: 6 } },
      { fields: { channel: 219, rating: 6 } }, // showing
      { fields: { channel: 5, rating: 10 } },
      { fields: { channel: 221, rating: 9 } },
    ];
    const location = {
      channels: { excluded: [209] },
      boxes: [{ channel: 206 }, { channel: 219 }, { channel: 206 }, { channel: 9 }],
    };
    const result = filterPrograms(ccPrograms, location);
    expect(result.length).toBe(3);
    // ensure sorted
    expect(result[0].fields.channel).toBe(5);
    expect(result[1].fields.channel).toBe(221);
    expect(result[2].fields.channel).toBe(209);
  });
  test('already showing and excluded', () => {
    const ccPrograms = [
      { fields: { channel: 9 } }, // showing
      { fields: { channel: 703 } }, // excluded
      { fields: { channel: 219 } },
      { fields: { channel: 5 } }, //showing
      { fields: { channel: 709 } }, //excluded
      { fields: { channel: 12 } },
    ];
    const location = {
      channels: { exclude: [703, 704, 705, 706, 707, 709, 709] },
      boxes: [{ channel: 5 }, { channel: 9 }, { channel: 19 }],
    };
    const result = filterPrograms(ccPrograms, location);
    expect(result.length).toBe(2);
    expect(result[0].fields.channel).toBe(219);
    expect(result[1].fields.channel).toBe(12);
  });
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
        summary: {
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
        summary: {
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
      console.log({ result });
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(5);
    });
  });
});
