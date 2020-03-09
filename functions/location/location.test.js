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
  replicatePrograms,
  setBoxStatus,
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
      live: {
        program: {
          clickerRating: r,
        },
      },
    };
  });
}

function createBoxes() {
  return [
    {
      live: {
        program: {
          clickerRating: 7,
        },
      },
    },
    {
      id: 5,
      live: {
        program: {
          game: {
            summary: {
              blowout: true,
              ended: false,
            },
          },
        },
      },
    },
    {
      live: {
        program: {
          clickerRating: 3,
        },
      },
    },
    {
      live: {
        program: {
          clickerRating: 9,
        },
      },
    },
    {
      id: 4,
      live: {
        program: {
          game: {
            summary: {
              ended: true,
            },
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
    expect(result.live.program.clickerRating).toBe(3);
  });
  test('findBoxWorseRating at least 2 null', () => {
    const program = { fields: { rating: 4 } };
    const result = findBoxWorseRating(createBoxes(), program);
    expect(result).toBe(null);
  });
  test('findBoxWorseRating at least 2', () => {
    const program = { fields: { rating: 5 } };
    const result = findBoxWorseRating(createBoxes(), program);
    expect(result.live.program.clickerRating).toBe(3);
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

const configuration = {
  automationActive: true,
};

describe('filterPrograms', () => {
  test('already showing', () => {
    const ccPrograms = [
      { fields: { rating: 7 }, db: { channel: 206 } }, // showing
      { fields: { rating: 6 }, db: { channel: 209 } },
      { fields: { rating: 6 }, db: { channel: 219 } }, // showing
      { fields: { rating: 8 }, db: { channel: 5 } },
      { fields: { rating: 7 }, db: { channel: 221 } },
    ];

    const location = {
      boxes: [
        { configuration, zone: '3', live: { channel: 206 } },
        { configuration, zone: '1', live: { channel: 219 } },
        { configuration, zone: '2', live: { channel: 206 } },
        { configuration, zone: '4', live: { channel: 9 } },
      ],
    };
    const result = filterPrograms(ccPrograms, location);
    expect(result.length).toBe(3);
    // ensure sorted
    console.log('result123');
    console.log(result[0].db);
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
      boxes: [
        { configuration, zone: '1', live: { channel: 5 } },
        { configuration, zone: '2', live: { channel: 9 } },
        { configuration, zone: '3', live: { channel: 19 } },
      ],
    };
    const result = filterPrograms(ccPrograms, location);
    expect(result.length).toBe(2);
    expect(result[0].db.channel).toBe(219);
    expect(result[1].db.channel).toBe(12);
  });
});
test("don't remove if 9 or 10 since they'll be replicated", () => {
  const ccPrograms = [
    { fields: { rating: 10 }, db: { channel: 9 } },
    { fields: { rating: 8 }, db: { channel: 206 } },
    { fields: { rating: 4 }, db: { channel: 220 } },
    { fields: { rating: 9 }, db: { channel: 703 } },
  ];
  const location = {
    boxes: [
      { configuration, zone: '1', live: { channel: 5 } },
      { configuration, zone: '2', live: { channel: 9 } },
      { configuration, zone: '3', live: { channel: 703 } },
      { configuration, zone: '4', live: { channel: 220 } },
    ],
  };
  const result = filterPrograms(ccPrograms, location);
  expect(result.length).toBe(3);
  expect(result[0].db.channel).toBe(9);
  expect(result[1].db.channel).toBe(703);
  expect(result[2].db.channel).toBe(206);
});
test('include clicker tv app boxes', () => {
  const ccPrograms = [
    { fields: { rating: 4 }, db: { channel: 219 } }, // on app
    { fields: { rating: 4 }, db: { channel: 209 } },
    { fields: { rating: 4 }, db: { channel: 9 } }, // on zone 2 box
    { fields: { rating: 4 }, db: { channel: 206 } }, // on app
  ];
  const location = {
    boxes: [
      { live: { channel: 209 } },
      { configuration, live: { channel: 9 }, zone: '2' },
      { live: { channel: 206 } },
      { configuration: { appActive: true }, live: { channel: 219 } },
    ],
  };
  const result = filterPrograms(ccPrograms, location);
  expect(result.length).toBe(3);
  expect(result[0].db.channel).toBe(219);
  expect(result[1].db.channel).toBe(209);
  expect(result[2].db.channel).toBe(206);
});
const automationActive = {
  configuration: {
    automationActive: true,
  },
};
const automationInactive = {
  configuration: {
    automationActive: false,
  },
};
describe('get boxes', () => {
  const openGoodBox = { ...automationActive, id: 1, zone: '4' };
  const openGoodBox2 = { ...automationActive, id: 2, zone: '3' };
  const reservedManuallyChangedRecently = {
    ...automationActive,
    id: 3,
    zone: 'A',
    live: {
      channelChangeSource: 'manual',
      channelChangeAt:
        moment()
          .subtract(33, 'm')
          .unix() * 1000,
      program: {
        clickerRating: 7,
      },
    },
  };
  const reservedManuallyChangedGameOn = {
    ...automationActive,
    id: 4,
    zone: '15',
    live: {
      channelChangeSource: 'manual',
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
    },
  };
  const openManuallyChangedDifferentProgram = {
    ...automationActive,
    id: 5,
    zone: '15',
    live: {
      channelChangeSource: 'manual',
      lockedProgrammingId: 'ABC',
      channelChangeAt:
        moment()
          .subtract(2, 'h')
          .unix() * 1000,
      program: {
        programmingId: 'DEF',
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
    },
  };
  const reservedManuallyChangedProgramOver = {
    ...automationActive,
    id: 6,
    zone: '15',
    live: {
      channelChangeSource: 'manual',
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
    },
  };
  const reservedZonelessBox = { ...automationInactive, id: 7, zone: '' };
  describe("getAvailableBoxes removes boxes that shouldn't be changed", () => {
    test('openGoodBox', () => {
      const result = getAvailableBoxes([openGoodBox]);
      expect(result.length).toBe(1);
    });
    test('openGoodBox 2', () => {
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
  describe('replicatePrograms for highly rated games', () => {
    const ten = {
      fields: {
        rating: 10,
      },
    };
    const nine = {
      fields: {
        rating: 9,
        programmingId: 'uljre2',
      },
    };
    const eight = {
      fields: {
        rating: 8,
        programmingId: 'abccf',
      },
    };
    const other = {
      fields: {
        rating: 4,
        programmingId: 'klsdjf',
      },
    };
    const other2 = {
      fields: {
        rating: 6,
      },
    };
    const other3 = {
      fields: {
        rating: 1,
      },
    };
    test('10 shows on all boxes', () => {
      const result = replicatePrograms([other, ten, other, other], 6);
      expect(result.filter(ccp => ccp.fields.rating === 10).length).toBe(6);
      expect(result.length).toBe(9);
    });
    test('9 shows on ~40% of 6 boxes', () => {
      const result = replicatePrograms([nine, other, other], 6);
      expect(result.filter(ccp => ccp.fields.rating === 9).length).toBe(2);
      expect(result.length).toBe(4);
    });
    test('9 shows on ~40% of 5 boxes', () => {
      const result = replicatePrograms([nine], 5);
      expect(result.filter(ccp => ccp.fields.rating === 9).length).toBe(2);
      expect(result.length).toBe(2);
    });
    test('9 shows on ~40% of 8 boxes', () => {
      const result = replicatePrograms([other, nine], 8);
      expect(result.filter(ccp => ccp.fields.rating === 9).length).toBe(3);
      expect(result.length).toBe(4);
    });
    test('9 shows on ~40% of 8 boxes, removes if already on two', () => {
      const result = replicatePrograms([other, nine], 8, [nine.fields.programmingId, nine.fields.programmingId]);
      expect(result.filter(ccp => ccp.fields.rating === 9).length).toBe(1);
      expect(result.length).toBe(2);
    });
    test('9 shows on ~40% of 8 boxes, removes if already on one', () => {
      const result = replicatePrograms([other, nine], 8, [nine.fields.programmingId, eight.fields.programmingId]);
      expect(result.filter(ccp => ccp.fields.rating === 9).length).toBe(2);
      expect(result.length).toBe(3);
    });
    test('8 shows on same amount of boxes', () => {
      const result = replicatePrograms([eight, other, other2, other3], 12);
      expect(result.filter(ccp => ccp.fields.rating === 8).length).toBe(1);
      expect(result.length).toBe(4);
    });
  });
  describe('targeting ids', () => {
    test('chooses most relevant already in order', () => {
      const ccPrograms = [
        {
          fields: {
            targetingIds: ['region:cincinnati', 'region:nyc'],
            rating: 6,
            programmingId: 'id123',
          },
        },
        {
          fields: {
            targetingIds: ['location:123'],
            rating: 8,
            programmingId: 'id123',
          },
        },
      ];
      const location = {
        id: '123',
        region: 'cincinnati',
      };
      const result = filterProgramsByTargeting(ccPrograms, location);
      expect(result.length).toBe(1);
      expect(result[0].fields.rating).toBe(8);
    });
    test('chooses most relevant flip-flopped', () => {
      const ccPrograms = [
        {
          fields: {
            targetingIds: ['location:123'],
            rating: 8,
            programmingId: 'id123',
          },
        },
        {
          fields: {
            targetingIds: ['region:cincinnati', 'region:nyc'],
            rating: 6,
            programmingId: 'id123',
          },
        },
      ];
      const location = {
        id: '123',
        region: 'cincinnati',
      };
      const result = filterProgramsByTargeting(ccPrograms, location);
      expect(result.length).toBe(1);
      expect(result[0].fields.rating).toBe(8);
    });
  });
});
describe('setBoxStatus', () => {
  describe('no program', () => {
    test('unlock if channel changed more than 4 hours ago', () => {
      const box = {
        live: {
          channelChangeSource: 'manual',
          channelChangeAt:
            moment()
              .subtract(6, 'h')
              .unix() * 1000,
        },
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeFalsy();
    });
    test('locked if channel changed less than 4 hours ago', () => {
      const box = {
        live: {
          channelChangeSource: 'manual',
          channelChangeAt:
            moment()
              .subtract(3, 'h')
              .unix() * 1000,
        },
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeTruthy();
    });
  });
  describe('manual zap', () => {
    const manualBox = { channelChangeSource: 'manual' };
    test('locked when recently changed', () => {
      const live = {
        ...manualBox,
        lockedUntil:
          moment()
            .subtract(10, 'm')
            .unix() * 1000,
      };
      const box = { live };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeTruthy();
    });
    test('locked when different program and before lock time', () => {
      const live = {
        ...manualBox,
        lockedProgrammingId: 'A',
        lockedUntil:
          moment()
            .add(1, 'm')
            .unix() * 1000,
        program: {
          programmingId: 'B',
        },
      };
      const box = { live };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeTruthy();
    });
    test('unlocked when different program on', () => {
      const live = {
        ...manualBox,
        lockedProgrammingId: 'A',
        lockedUntil:
          moment()
            .subtract(1.5, 'h')
            .unix() * 1000,
        program: {
          programmingId: 'B',
        },
      };
      const box = {
        live,
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeFalsy();
    });
    test('unlocked when changed a while ago with same program on, but way later (repeat program)', () => {
      const live = {
        ...manualBox,
        lockedProgrammingId: 'A',
        channelChangeAt:
          moment()
            .subtract(6.1, 'h')
            .unix() * 1000,
        program: {
          programmingId: 'A',
          start:
            moment()
              .subtract(1.2, 'h')
              .unix() * 1000,
        },
      };
      const box = {
        live,
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeFalsy();
    });
  });
  describe('automation zap', () => {
    const automationBox = { channelChangeSource: 'automation' };
    test('unlocked with different program on', () => {
      const live = {
        ...automationBox,
        lockedProgrammingId: 'A',
        program: {
          programmingId: 'B',
        },
      };
      const box = {
        live,
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeFalsy();
    });
    test('unlocked with same program on, but way later (repeat program)', () => {
      const live = {
        ...automationBox,
        channelChangeAt:
          moment()
            .subtract(6.1, 'h')
            .unix() * 1000,
        lockedProgrammingId: 'A',
        program: {
          programmingId: 'A',
          start:
            moment()
              .subtract(1.2, 'h')
              .unix() * 1000,
        },
      };
      const box = {
        live,
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeFalsy();
    });
    test('locked with same program on, recently changed', () => {
      const live = {
        ...automationBox,
        channelChangeAt:
          moment()
            .subtract(0.2, 'h')
            .unix() * 1000,
        lockedProgrammingId: 'A',
        program: {
          programmingId: 'A',
          start:
            moment()
              .subtract(1.2, 'h')
              .unix() * 1000,
        },
      };
      const box = {
        live,
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeTruthy();
    });
    test('locked with same program on past end time', () => {
      const live = {
        ...automationBox,
        channelChangeAt:
          moment()
            .subtract(0.1, 'h')
            .unix() * 1000,
        lockedProgrammingId: 'A',
        program: {
          programmingId: 'A',
          end:
            moment()
              .subtract(0.2, 'h')
              .unix() * 1000,
        },
      };
      const box = {
        live,
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeTruthy();
    });
  });
  describe('app zap changes', () => {
    const appBox = { channelChangeSource: 'app' };
    test('locked before reservation end time', () => {
      const box = {
        live: {
          ...appBox,
          lockedUntil:
            moment()
              .add(3, 'm')
              .unix() * 1000,
        },
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeTruthy();
    });
    test('unlocked after reservation end time', () => {
      const box = {
        live: {
          ...appBox,
          lockedUntil:
            moment()
              .subtract(3, 'm')
              .unix() * 1000,
        },
      };
      const result = setBoxStatus(box);
      expect(result.live.locked).toBeFalsy();
    });
  });
});
