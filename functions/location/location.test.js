const file = require('./location');
const {
  ControlCenterProgram,
  getAvailableBoxes,
  filterPrograms,
  findBoxGameOver,
  findBoxBlowout,
  findBoxWithoutRating,
  findBoxWorseRating,
  filterProgramsByTargeting,
} = require('./location');
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

function createBoxesByRatings(ratings) {
  return ratings.map(r => {
    return {
      program: {
        clickerRating: r,
      },
    };
  });
}

function createBoxes() {
  return [
    {
      program: {
        clickerRating: 7,
      },
    },
    {
      id: 5,
      program: {
        game: {
          summary: {
            blowout: true,
            ended: false,
          },
        },
      },
    },
    {
      program: {
        clickerRating: 3,
      },
    },
    {
      program: {
        clickerRating: 9,
      },
    },
    {
      id: 4,
      program: {
        game: {
          summary: {
            ended: true,
          },
        },
      },
    },
  ];
}

describe('findBox', () => {
  test('findBoxWorseRating', () => {
    const program = { fields: { rating: 6 } };
    const result = findBoxWorseRating(createBoxes(), program);
    expect(result.program.clickerRating).toBe(3);
  });
  test('findBoxGameOver', () => {
    const result = findBoxGameOver(createBoxes());
    expect(result.id).toBe(4);
  });
  test('findBoxBlowout', () => {
    const result = findBoxBlowout(createBoxes());
    expect(result.id).toBe(5);
  });
  test('findBoxWithoutRating', () => {
    const result = findBoxWithoutRating(createBoxes());
    expect(result.id).toBe(5);
  });
});

describe('filterPrograms', () => {
  test('already showing', () => {
    const ccPrograms = [
      { fields: { rating: 9 }, db: { channel: 206 } }, // showing
      { fields: { rating: 6 }, db: { channel: 209 } },
      { fields: { rating: 6 }, db: { channel: 219 } }, // showing
      { fields: { rating: 10 }, db: { channel: 5 } },
      { fields: { rating: 9 }, db: { channel: 221 } },
    ];
    const location = {
      boxes: [
        { zone: '3', channel: 206 },
        { zone: '1', channel: 219 },
        { zone: '2', channel: 206 },
        { zone: '4', channel: 9 },
      ],
    };
    const result = filterPrograms(ccPrograms, location);
    expect(result.length).toBe(3);
    // ensure sorted
    expect(result[0].db.channel).toBe(5);
    expect(result[1].db.channel).toBe(221);
    expect(result[2].db.channel).toBe(209);
  });
  test('already showing and excluded', () => {
    const ccPrograms = [
      { fields: { rating: 4 }, db: { channel: 9 } }, // showing
      { fields: { rating: 4 }, db: { channel: 703 } }, // excluded
      { fields: { rating: 4 }, db: { channel: 219 } },
      { fields: { rating: 4 }, db: { channel: 5 } }, //showing
      { fields: { rating: 4 }, db: { channel: 709 } }, //excluded
      { fields: { rating: 4 }, db: { channel: 12 } },
    ];
    const location = {
      channels: { exclude: [703, 704, 705, 706, 707, 709, 709] },
      boxes: [{ zone: '1', channel: 5 }, { zone: '2', channel: 9 }, { zone: '3', channel: 19 }],
    };
    const result = filterPrograms(ccPrograms, location);
    expect(result.length).toBe(2);
    expect(result[0].db.channel).toBe(219);
    expect(result[1].db.channel).toBe(12);
  });
});
test('exclude clicker tv app boxes', () => {
  const ccPrograms = [
    { fields: { rating: 4 }, db: { channel: 219 } }, // on app
    { fields: { rating: 4 }, db: { channel: 209 } },
    { fields: { rating: 4 }, db: { channel: 9 } }, // on zone 2 box
    { fields: { rating: 4 }, db: { channel: 206 } }, // on app
  ];
  const location = {
    boxes: [{ channel: 209 }, { channel: 9, zone: '2' }, { channel: 206 }, { appActive: true, channel: 219 }],
  };
  const result = filterPrograms(ccPrograms, location);
  expect(result.length).toBe(3);
  expect(result[0].db.channel).toBe(219);
  expect(result[1].db.channel).toBe(209);
  expect(result[2].db.channel).toBe(206);
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
        .subtract(33, 'm')
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
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(5);
    });
  });
});

describe("filterProgramsByTargeting: remove programs that aren't targeted", () => {
  test('with matching region and non-matching location', () => {
    const ccProgram = {
      fields: {
        targetingIds: ['region:cincinnati', 'location:230948234'],
      },
    };
    const location = {
      id: 'non-matching',
      region: 'cincinnati',
    };
    const result = filterProgramsByTargeting([ccProgram], location);
    expect(result.length).toBe(1);
  });
  test('with matching region and matching location', () => {
    const ccProgram = {
      fields: {
        targetingIds: ['region:cincinnati', 'location:matching'],
      },
    };
    const location = {
      id: 'matching',
      region: 'cincinnati',
    };
    const result = filterProgramsByTargeting([ccProgram], location);
    expect(result.length).toBe(1);
  });
  test('with non-matching region and non-matching location', () => {
    const ccProgram = {
      fields: {
        targetingIds: ['region:chicago', 'location:non-matching'],
      },
    };
    const location = {
      id: '30945435',
      region: 'cincinnati',
    };
    const result = filterProgramsByTargeting([ccProgram], location);
    expect(result.length).toBe(0);
  });
  test('with non-matching region and matching location', () => {
    const ccProgram = {
      fields: {
        targetingIds: ['region:chicago', 'location:matching'],
      },
    };
    const location = {
      id: 'matching',
      region: 'cincinnati',
    };
    const result = filterProgramsByTargeting([ccProgram], location);
    expect(result.length).toBe(1);
  });
  test('with no region and no matching location', () => {
    const ccProgram = {
      fields: {
        targetingIds: ['location:other'],
      },
    };
    const location = {
      id: '938475',
      region: 'cincinnati',
    };
    const result = filterProgramsByTargeting([ccProgram], location);
    expect(result.length).toBe(0);
  });
  test('with multiple regions', () => {
    const ccProgram = {
      fields: {
        targetingIds: ['region:cincinnati', 'region:nyc'],
      },
    };
    const location = {
      id: '938475',
      region: 'cincinnati',
    };
    const result = filterProgramsByTargeting([ccProgram], location);
    expect(result.length).toBe(1);
  });
  test('with program with no targetingIds', () => {
    const ccProgram = {
      fields: {},
    };
    const location = {
      id: 'matching',
      region: 'cincinnati',
    };
    const result = filterProgramsByTargeting([ccProgram], location);
    expect(result.length).toBe(1);
  });
});
