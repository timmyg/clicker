// @flow
const { respond, getBody, getPathParameters, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const geolib = require('geolib');
const moment = require('moment-timezone');
// const momentHelper = require('helper-moment');
const mustache = require('mustache');
const uuid = require('uuid/v1');
const url = require('url');
const Airtable = require('airtable');
const { Model } = require('dynamodb-toolbox');

// const awsXRay = require('aws-xray-sdk');
// const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
let AWS;
if (!process.env.IS_LOCAL) {
  AWS = require('aws-xray-sdk').captureAWS(require('aws-sdk'));
} else {
  console.info('Serverless Offline detected; skipping AWS X-Ray setup');
  AWS = require('aws-sdk');
}
const zapTypes = {
  manual: 'manual',
  app: 'app',
  automation: 'automation',
};

declare class process {
  static env: {
    stage: string,
    tableLocation: string,
    airtableKey: string,
    airtableBase: string,
    NODE_ENV: string,
    IS_LOCAL: string,
  };
}
if (process.env.NODE_ENV === 'test') {
  dynamoose.AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'test',
  });
}

// duplicated!
const allPackages: any = [
  {
    name: 'NFL Sunday Ticket',
    channels: [703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719],
  },
];

const dbLocation = dynamoose.model(
  process.env.tableLocation,
  {
    id: {
      type: String,
      default: uuid,
      hashKey: true,
    },
    losantId: {
      type: String,
      required: true,
      index: {
        global: true,
        project: true, // ProjectionType: ALL
      },
    },
    _v: {
      type: Number,
      index: {
        global: true,
        project: false, // ProjectionType: KEYS_ONLY
      },
    },
    shortId: {
      type: String,
      index: {
        global: true,
        project: false, // ProjectionType: KEYS_ONLY
      },
    },
    boxes: [
      {
        id: String,
        zone: String,
        label: String, // physical label id on tv (defaults to locationName)
        info: {
          clientAddress: String, // dtv calls this clientAddr
          locationName: String, // dtv name
          ip: String,
          notes: String,
        },
        configuration: {
          appActive: Boolean,
          automationActive: Boolean, // new
        },
        live: {
          locked: Boolean, // new, dynamic
          lockedUntil: Number, // date
          // lockedProgrammingId: String,
          lockedProgrammingIds: {
            type: 'list',
            list: [
              {
                type: 'string',
              },
            ],
          },
          lockedMessage: String,
          channelChangeSource: {
            type: String,
            enum: [zapTypes.app, zapTypes.automation, zapTypes.manual],
          },
          channel: Number,
          channelMinor: Number,
          channelChangeAt: Number, // date
          // program: Map, // populated every few minutes
        },
        updatedAt: Number, // date
        updatedSource: String,
      },
    ],
    channels: {
      exclude: {
        type: 'list',
        list: [
          {
            type: 'string',
          },
        ],
      },
    },
    packages: {
      type: 'list',
      list: [
        {
          type: 'string',
        },
      ],
    },
    name: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String },
    // zip: { type: String, required: true },
    geo: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    demo: Boolean,
    free: Boolean,
    losantProductionOverride: Boolean,
    img: String,
    client: String,
    region: String,
    active: Boolean,
    hidden: Boolean,
    connected: Boolean,
    controlCenter: Boolean,
    vipOnly: Boolean,
    announcement: String,
    notes: String,
    // calculated fields
    distance: Number,
    openTvs: Boolean,
  },
  {
    saveUnknown: ['program'],
    timestamps: true,
    allowEmptyArray: true,
  },
);

module.exports.all = RavenLambdaWrapper.handler(Raven, async event => {
  let latitude, longitude;
  const pathParams = getPathParameters(event);
  // const { partner, clicker, app } = event.headers;
  // console.log({ partner, clicker, app });
  // console.time('entire');
  const milesRadius =
    event.queryStringParameters && event.queryStringParameters.miles ? event.queryStringParameters.miles : null;
  console.log({ milesRadius });

  if (pathParams) {
    latitude = pathParams.latitude;
    longitude = pathParams.longitude;
    console.log('lat/lng', latitude, longitude);
  }
  console.time('db call');
  let allLocations: Venue[] = await dbLocation.scan().exec();
  console.log('locations', allLocations.length);
  console.timeEnd('db call');

  // set whether open tv's
  allLocations.forEach((l, i, locations) => {
    if (l.boxes) {
      l.boxes = l.boxes.map(b => setBoxStatus(b));
      l.openTvs = l.boxes
        .filter(b => b.configuration)
        .filter(b => b.configuration.appActive)
        .some(b => !b.live.locked);
    }
  });

  allLocations.forEach((l, i, locations) => {
    // delete l.boxes;
    // delete l.losantId;
    l = { ...l, boxes: null, losantId: null };
    if (latitude && longitude) {
      const { latitude: locationLatitude, longitude: locationLongitude } = l.geo;
      const meters = geolib.getDistanceSimple(
        { latitude, longitude },
        { latitude: locationLatitude, longitude: locationLongitude },
      );
      // console.log({ meters });
      const miles = geolib.convertUnit('mi', meters);
      const roundedMiles = Math.round(10 * miles) / 10;
      locations[i].distance = roundedMiles;
    }
  });
  console.log({ allLocations });
  if (milesRadius && latitude && longitude) {
    allLocations = allLocations.filter(l => l.distance <= milesRadius);
  }
  console.log('locations after geo', allLocations.length);
  const sorted = allLocations.sort((a, b) => (a.distance < b.distance ? -1 : 1));
  console.timeEnd('entire');
  console.log('returning', sorted.length);
  return respond(200, sorted);
});

module.exports.getBox = RavenLambdaWrapper.handler(Raven, async event => {
  const { id, boxId } = getPathParameters(event);
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();
  const box = location.boxes.find(b => b.id === boxId);
  return respond(200, setBoxStatus(box));
});

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);

  // console.time('get from db');
  // const location: Venue = await dbLocation
  //   .queryOne('id')
  //   .eq(id)
  //   .exec();
  // console.timeEnd('get from db');
  const location: Venue = await getLocationWithBoxes(id);
  if (!location) {
    return respond(400, 'location doesnt exist');
  }

  // demo stuff
  if (location.demo) {
    const demoBoxes: any[] = [
      { id: '1', label: 'TV 1' },
      { id: '2', label: 'TV 2' },
      { id: '3', label: 'TV 3' },
      { id: '4', label: 'TV 4' },
    ];
    location.boxes = demoBoxes;
    return respond(200, location);
  }

  // loop through boxes, and update reserved status if necessary
  if (location.boxes) {
    console.time('update reserved status');
    location.boxes = location.boxes.map(b => setBoxStatus(b));
    console.timeEnd('update reserved status');

    console.time('filter + sort');
    if (event.headers && event.headers.app && event.headers.app.length) {
      location.boxes = location.boxes.filter(b => b.configuration).filter(b => b.configuration.appActive);
    }

    // filter out inactive boxes
    // sort boxes alphabetically
    location.boxes = location.boxes.sort((a, b) => {
      return (a.label || '').localeCompare(b.label || '');
    });
    console.timeEnd('filter + sort');
  }

  // delete location.losantId;

  // set distance
  console.time('set geo distance');
  if (event.queryStringParameters && event.queryStringParameters.latitude && event.queryStringParameters.longitude) {
    const { latitude, longitude } = event.queryStringParameters;
    console.log({ latitude, longitude });
    const { latitude: locationLatitude, longitude: locationLongitude } = location.geo;
    console.log(
      { latitude: +latitude, longitude: +longitude },
      { latitude: locationLatitude, longitude: locationLongitude },
    );
    const meters = geolib.getDistanceSimple(
      { latitude: +latitude, longitude: +longitude },
      { latitude: locationLatitude, longitude: locationLongitude },
    );
    const miles = geolib.convertUnit('mi', meters);
    const roundedMiles = Math.round(10 * miles) / 10;
    location.distance = roundedMiles;
  }
  console.timeEnd('set geo distance');

  return respond(200, location);
});

function setBoxStatus(box: Box): Box {
  console.log({ box: JSON.stringify(box) });
  // locked: Boolean, // new
  // lockedUntil: Date,
  // lockedProgrammingId: String,
  // lockedMessage: String,

  /*
  
  manual zap
    - locked if before lockedUntil
    - locked if after lockedUntil 
        and lockedProgrammingId === box.program.programmingId
        and box.program.start within past 6 hours (to prevent replays)
  app zap
    - locked if before lockedUntil
  automation zap
    - locked if lockedProgrammingId === box.program.programmingId
        and box.program.start within past 6 hours (to prevent replays)
   */
  if (!box.live) {
    // $FlowFixMe
    box.live = {
      locked: false,
    };
    return box;
  }

  // dont have live object or program
  if (
    (!box.live || !box.live.program) &&
    [zapTypes.manual, zapTypes.automation].includes(box.live.channelChangeSource)
  ) {
    const lastChangeHoursFromNow = moment.duration(moment(box.live.channelChangeAt).diff(moment())).asHours();
    box.live.locked = lastChangeHoursFromNow >= -4;
    if (box.live.locked) {
      box.live.lockedMessage = 'Sorry, TV is currently locked';
    }
    return box;
  }

  const now = moment();
  const isBeforeLockedTime = now.isBefore(box.live.lockedUntil);
  const isAfterLockedTime = !isBeforeLockedTime;
  const isZappedProgramStillOn =
    box.live.program &&
    // box.live.lockedProgrammingId === box.live.program.programmingId &&
    !!box.live.lockedProgrammingIds &&
    box.live.lockedProgrammingIds.includes(box.live.program.programmingId) &&
    moment.duration(moment(box.live.channelChangeAt).diff(moment(box.live.program.start))).asHours() >= -2; // channel change was more than 2 hours before start, so might be a repeat
  console.log({ isZappedProgramStillOn });
  // console.log('hiiiiiiii', box.live);
  // lock box if we cant find a program
  // if (
  //   box.configuration &&
  //   box.configuration.automationActive &&
  //   (!box.live.program || Object.keys(box.live.program).length === 0)
  // ) {
  //   console.log('no program****');
  //   box.live.locked = true;
  //   box.live.lockedMessage = 'Sorry, TV is locked';
  //   const text = `Box is Locked: Program not found ${box.live.channel} (boxId: ${box.id})`;

  //   // not sure if this will work but yolo
  //   (async () => {
  //     await new Invoke()
  //       .service('notification')
  //       .name('sendControlCenter')
  //       .body({ text })
  //       .async()
  //       .go();
  //   })();
  // } else
  if (zapTypes.manual === box.live.channelChangeSource) {
    box.live.locked = isBeforeLockedTime || isZappedProgramStillOn;
    // TODO isBeforeLockedTime is sometimes true
    if (box.live.locked) {
      box.live.lockedMessage = 'Sorry, TV is locked';
    }
  } else if (zapTypes.app === box.live.channelChangeSource) {
    box.live.locked = isBeforeLockedTime || (isAfterLockedTime && isZappedProgramStillOn);
    if (box.live.locked) {
      if (isBeforeLockedTime) {
        const minutes = moment(box.live.lockedUntil).diff(moment(), 'minutes');
        box.live.lockedMessage = `Sorry, TV is locked for the next ${minutes} minutes`;
      } else if (isAfterLockedTime && isZappedProgramStillOn) {
        box.live.lockedMessage = `Sorry, TV is locked until <b>${box.live.program.title}</b> on ${box.live.program.channelTitle} is over`;
      }
    }
  } else if (zapTypes.automation === box.live.channelChangeSource) {
    box.live.locked = isZappedProgramStillOn;
    if (box.live.locked) {
      box.live.lockedMessage = `Sorry, TV is locked until <b>${box.live.program.title}</b> is over`;
    }
  }
  console.log({ box });
  return box;
}

module.exports.delete = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);
  const location: Venue = await dbLocation.delete({ id });
  return respond(202, location);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const body = getBody(event);
    body._v = 2;
    if (body.id) {
      const existingLocation: Venue = await dbLocation
        .queryOne('id')
        .eq(body.id)
        .exec();
      if (existingLocation) {
        return respond(200, existingLocation);
      }
    }
    const location: Venue = await dbLocation.create(body);
    return respond(201, location);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
});

module.exports.update = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const { id } = getPathParameters(event);
    const body = getBody(event);

    const updatedLocation: Venue = await dbLocation.update({ id }, body, {
      returnValues: 'ALL_NEW',
    });
    return respond(200, updatedLocation);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
});

module.exports.setBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  const { boxes: requestBoxes, ip } = getBody(event);
  const { id } = getPathParameters(event);

  // const {data: {boxes: locationBoxes}} = await new Invoke()
  //   .service('box')
  //   .name('getAll')
  //   .pathParams({locationId: id})
  //   .go();
  // const locationBoxes = await getLocationBoxes(id);
  const location = await getLocationWithBoxes(id);

  for (const dtvBox: DirecTVBoxRaw of requestBoxes) {
    const isExistingBox =
      location.boxes &&
      location.boxes.find(
        locationBox =>
          locationBox.info && locationBox.info.ip === ip && locationBox.info.clientAddress === dtvBox.clientAddr,
      );
    if (!isExistingBox) {
      console.log('add new box!', ip);

      console.log({ locationId: id });
      console.log({ ip, boxes: dtvBox });

      await new Invoke()
        .service('box')
        .name('createDirectv')
        .pathParams({ locationId: id })
        .body({
          ip,
          boxes: [dtvBox],
        })
        .async()
        .go();

      const text = `*New DirecTV Box Added* ${JSON.stringify(dtvBox)}`;
      // await new Invoke()
      //   .service('notification')
      //   .name('sendAntenna')
      //   .body({ text })
      //   .async()
      //   .go();
      await new Invoke()
        .service('notification')
        .name('sendTasks')
        .body({ text, importance: 1 })
        .async()
        .go();
    } else {
      console.log('existing box', dtvBox.ip);
    }
  }

  return respond(201);
});

module.exports.syncAirtableRegions = RavenLambdaWrapper.handler(Raven, async event => {
  const { data: regions } = await new Invoke()
    .service('program')
    .name('regions')
    .go();
  console.log({ regions });

  const airtableDataTable = 'Data';
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtableRegions = await base(airtableDataTable)
    .select({
      filterByFormula: `{type} = 'region'`,
    })
    .all();
  const airtableRegionIds: string[] = airtableRegions.map(l => l.fields.id);
  const newRegions = regions.filter(dbRegion => {
    return !airtableRegionIds.includes(dbRegion.id);
  });

  let count = 0;
  if (newRegions && newRegions.length) {
    const promises = [];
    newRegions.forEach(newRegion => {
      count++;
      promises.push(
        base(airtableDataTable).create({
          id: newRegion.id,
          type: 'region',
          name: newRegion.name,
        }),
      );
    });
    await Promise.all(promises);
  }
  return respond(200, { count });
});

// module.exports.syncAirtableLocations = RavenLambdaWrapper.handler(Raven, async event => {
//   const dbLocations: Venue[] = await dbLocation.scan().exec();
//   const airtableDataTable = 'Data';
//   const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
//   const airtableLocations = await base(airtableDataTable)
//     .select({
//       filterByFormula: `{type} = 'location'`,
//     })
//     .all();
//   const airtableLocationIds: string[] = airtableLocations.map(l => l.fields.id);
//   const newLocations = dbLocations.filter(dbLocation => {
//     return !airtableLocationIds.includes(dbLocation.id);
//   });
//   let count = 0;
//   if (newLocations && newLocations.length) {
//     const promises = [];
//     newLocations.forEach(newLocation => {
//       count++;
//       promises.push(
//         base(airtableDataTable).create({
//           id: newLocation.id,
//           type: 'location',
//           name: `${newLocation.name}: ${newLocation.neighborhood}`,
//         }),
//       );
//     });
//     await Promise.all(promises);
//   }
//   return respond(200, { count });
// });

module.exports.setBoxReserved = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId, boxId } = getPathParameters(event);
  const { end } = getBody(event);
  console.log({ locationId, boxId, end });

  // const location: Venue = await dbLocation
  //   .queryOne('id')
  //   .eq(locationId)
  //   .exec();

  // const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  // location.boxes[boxIndex].live.lockedUntil = end;
  // await location.save();
  await new Invoke()
    .service('box')
    .name('updateChannel')
    .body({
      lockedUntil: end,
    })
    .pathParams({ locationId, boxId })
    .async()
    .go();

  return respond(200);
});

module.exports.setBoxFree = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId, boxId } = getPathParameters(event);

  // const location: Venue = await dbLocation
  //   .queryOne('id')
  //   .eq(locationId)
  //   .exec();

  // const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  // // location.boxes[boxIndex].reserved = false;
  // // location.boxes[boxIndex].end;
  // location.boxes[boxIndex].live.lockedUntil = moment().unix() * 1000;
  // await location.save();
  await new Invoke()
    .service('box')
    .name('updateChannel')
    .body({
      lockedUntil: 0,
    })
    .pathParams({ locationId, boxId })
    .async()
    .go();

  return respond(200);
});

async function getLocationBoxes(locationId) {
  const {
    data: { boxes: locationBoxes },
  } = await new Invoke()
    .service('box')
    .name('getAll')
    .pathParams({ locationId })
    .go();
  return locationBoxes;
}

// TODO use graphql for this
async function getLocationWithBoxes(locationId) {
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationId)
    .exec();
  const { data: locationBoxes } = await new Invoke()
    .service('box')
    .name('getAll')
    .pathParams({ locationId })
    .go();
  location.boxes = locationBoxes;
  console.log({ locationId, location });
  return location;
}

// called from antenna
module.exports.saveBoxesInfo = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId } = getPathParameters(event);
  const { boxes } = getBody(event);
  // console.log(boxes);
  // const location: Venue = await dbLocation
  //   .queryOne('id')
  //   .eq(locationId)
  //   .exec();
  // console.log({ location });

  // const locationBoxes = await getLocationBoxes(locationId);
  const location = await getLocationWithBoxes(locationId);

  for (const box: DirecTVBox of boxes) {
    const { boxId, info } = box;
    // if (!boxId) {
    //   const error = 'must provide boxId';
    //   console.error(error);
    //   return respond(400, error);
    // }

    console.log(boxId, info);

    const { major } = info;
    let { minor } = info;
    if (minor >= 10) {
      minor = null;
    }

    const locationBox = location.boxes.find(lb => lb.id === boxId);
    const originalChannel = locationBox.live && locationBox.live.channel;
    console.log('original channel', originalChannel);
    console.log('current channel', major);

    let source = '';
    if (originalChannel !== major) {
      source = zapTypes.manual;
      // let program: Program = null;

      // $FlowFixMe
      // let updateBoxInfoBody: BoxInfoRequest = {
      //   channel: major,
      //   channelMinor: minor,
      // };
      // updateBoxInfoBody.source = zapTypes.manual;
      // updateBoxInfoBody.channelChangeAt = moment().unix() * 1000;
      // updateBoxInfoBody.lockedProgrammingIds = [];

      // console.log({ channel: major, region: location.region });
      // const queryParams = { channel: major, channelMinor: minor, region: location.region };
      // const programResult = await new Invoke()
      //   .service('program')
      //   .name('get')
      //   .queryParams(queryParams)
      //   .go();
      // if (!programResult || !programResult.data) {
      //   await new Invoke()
      //     .service('notification')
      //     .name('sendManual')
      //     .body({ text: JSON.stringify(queryParams) })
      //     .async()
      //     .go();
      // }
      // program = programResult && programResult.data;
      // console.log({ program });
      // const hasProgram = !!program && !!program.programmingId;
      // const manualLockDurationHours = 1.5;
      // const manualLockUnknownProgramDurationHours = 3.5;
      // const manualLockAppDurationHours = 0;
      // const isBoxAppOnly =
      //   location.boxes[i].configuration.appActive && !location.boxes[i].configuration.automationActive;
      // let lockHours;
      // if (isBoxAppOnly) {
      //   lockHours = manualLockAppDurationHours;
      // } else if (hasProgram) {
      //   lockHours = manualLockDurationHours;
      // } else {
      //   lockHours = manualLockUnknownProgramDurationHours;
      // }
      // updateBoxInfoBody.lockedUntil =
      //   moment()
      //     .add(lockHours, 'h')
      //     .unix() * 1000;

      // const lockMinutes = moment(moment(updateBoxInfoBody.lockedUntil)).diff(moment(), 'minutes');
      // if (hasProgram && !isBoxAppOnly) {
      //   updateBoxInfoBody.lockedProgrammingIds = [program.programmingId];
      // }

      // also, lets check what's on in 65 mins and lock that if it's a game
      // queryParams.time =
      //   moment()
      //     .add(65, 'm')
      //     .unix() * 1000;
      // const programResult2 = await new Invoke()
      //   .service('program')
      //   .name('get')
      //   .queryParams(queryParams)
      //   .go();
      // const program2 = programResult2 && programResult2.data;
      // console.log({ program2 });
      // if (!isBoxAppOnly && program2 && program2.programmingId && program.gameId) {
      //   updateBoxInfoBody.lockedProgrammingIds.push(program2.programmingId);
      // }
      // }

      // tg moved this to inside manual change block
      // await new Invoke()
      //   .service('location')
      //   .name('updateBoxInfo')
      //   .body(updateBoxInfoBody)
      //   .pathParams({ id: location.id, boxId })
      //   .async()
      //   .go();

      // if channel is different and is a control center box
      //  - track via analytics

      // if (originalChannel !== major) {
      // const userId = 'system';
      // const name = 'Manual Zap';
      // const data = {
      //   from: originalChannel,
      //   to: major,
      //   locationId: location.id,
      //   locationName: location.name,
      //   locationNeighborhood: location.neighborhood,
      // };
      // await new Invoke()
      //   .service('analytics')
      //   .name('track')
      //   .body({ userId, name, data })
      //   .async()
      //   .go();

      // if control center or app box
      //  - send slack notif
      //  - send to airtable sheet

      // if (location.boxes[i].configuration.automationActive || location.boxes[i].configuration.appActive) {
      //   const previousProgram = location.boxes[i].live && location.boxes[i].live.program;
      //   const previousChannel = location.boxes[i].live && location.boxes[i].live.channel;
      //   const zoneName = `Z${location.boxes[i].zone || ''}` || 'Z-';
      //   const labelName = `L${location.boxes[i].label || ''}` || 'L-';
      //   let text = `Manual Zap @ ${location.name} (${location.neighborhood} ${zoneName},${labelName}) *${program &&
      //     program.channelTitle}: ${program && program.title} [${major}]* ~${previousProgram &&
      //     previousProgram.channelTitle}: ${previousProgram && previousProgram.title} [${previousChannel}]~`;
      //   text += `\nLocking TV for ${lockMinutes} minutes`;

      //   if (!hasProgram) {
      //     let unknownProgramText = `*Unknown channel programming* ${JSON.stringify(queryParams)}\n`;
      //     unknownProgramText += `Locking TV for ${lockMinutes} minutes`;
      //     await new Invoke()
      //       .service('notification')
      //       .name('sendTasks')
      //       .body({ text: unknownProgramText, importance: 2 })
      //       .async()
      //       .go();
      //   }

      //   const isRecentAutomationChange =
      //     location.boxes[i].live &&
      //     location.boxes[i].live.channelChangeSource === 'automation' &&
      //     moment().diff(moment(location.boxes[i].live.channelChangeAt), 'minutes') < 10;
      //   if (isRecentAutomationChange) {
      //     text = `*Recent Automation Change!* ${text}`;
      //     await new Invoke()
      //       .service('notification')
      //       .name('sendTasks')
      //       .body({ text, importance: 2 })
      //       .async()
      //       .go();
      //   }
      //   //   await new Invoke()
      //   //     .service('notification')
      //   //     .name('sendManual')
      //   //     .body({ text: "" })
      //   //     .async()
      //   //     .go();
      //   // }

      await new Invoke()
        .service('notification')
        .name('sendManual')
        .body({ text: `manual zap ${locationBox.id} from ${originalChannel} to ${major}` })
        .async()
        .go();

      //   await new Invoke()
      //     .service('admin')
      //     .name('logChannelChange')
      //     .body({
      //       location,
      //       box: location.boxes[i],
      //       program,
      //       time: new Date(),
      //       type: name,
      //     })
      //     .async()
      //     .go();
      // }
    }

    await new Invoke()
      .service('box')
      .name('updateChannel')
      .body({
        channel: major,
        channelMinor: minor,
        channelChangeSource: source,
        channelChangeAt: moment().unix() * 1000,
      })
      .pathParams({ locationId, boxId })
      .async()
      .go();
  }

  return respond(200);
});

module.exports.connected = RavenLambdaWrapper.handler(Raven, async event => {
  const { losantId } = getPathParameters(event);

  const connected = true;
  const location: Venue = await dbLocation
    .queryOne('losantId')
    .eq(losantId)
    .exec();
  console.log({ location });
  if (!!location) {
    await dbLocation.update({ id: location.id }, { connected }, { returnValues: 'ALL_NEW' });
  }
  const text = `Antenna Connected @ ${location ? location.name : 'unknown losantId'} (${
    location ? location.neighborhood : ''
  })`;
  await new Invoke()
    .service('notification')
    .name('sendTasks')
    .body({ text, importance: 1 })
    .async()
    .go();

  return respond(200, 'ok');
});

module.exports.disconnected = RavenLambdaWrapper.handler(Raven, async event => {
  const { losantId } = getPathParameters(event);

  const connected = false;
  const location: Venue = await dbLocation
    .queryOne('losantId')
    .eq(losantId)
    .exec();
  console.log({ location });
  if (!!location) {
    await dbLocation.update({ id: location.id }, { connected }, { returnValues: 'ALL_NEW' });
  }

  const text = `Antenna Disconnected @ ${location ? location.name : 'unknown losantId'} (${
    location ? location.neighborhood : ''
  })`;
  await new Invoke()
    .service('notification')
    .name('sendTasks')
    .body({ text, importance: 1 })
    .async()
    .go();

  return respond(200, 'ok');
});

module.exports.checkAllBoxesInfo = RavenLambdaWrapper.handler(Raven, async event => {
  let allLocations: Venue[] = await dbLocation.scan().exec();

  let i = 0;
  for (const location of allLocations) {
    const { losantId, losantProductionOverride } = location;
    // $FlowFixMe
    const body: CheckBoxesInfoRequest = {
      losantId,
      losantProductionOverride,
      boxes: [],
    };

    // const locationBoxes = await getLocationBoxes(location.id);
    const locationWithBoxes = await getLocationWithBoxes(location.id);
    if (locationWithBoxes.boxes) {
      for (const box of locationWithBoxes.boxes) {
        const { id: boxId, info } = box;
        const { ip, clientAddress: client } = info;
        body.boxes.push({ boxId, ip, client });
      }
      console.log('locationWithBoxes.boxes', locationWithBoxes.boxes.length);
      if (losantId.length > 3 && !!body.boxes.length) {
        console.log({ body });
        console.log(i);
        await new Invoke()
          .service('remote')
          .name('checkBoxesInfo')
          .body(body)
          .async()
          .go();
      }
    }
    i++;
  }
  return respond(200, 'ok');
});

module.exports.controlCenterLocationsByRegion = RavenLambdaWrapper.handler(Raven, async event => {
  const { regions } = getPathParameters(event);
  console.log(regions);
  if (!regions || !regions.length) {
    return respond(200, []);
  }
  const locations: Venue[] = await dbLocation
    .scan()
    .filter('active')
    .eq(true)
    .and()
    .filter('controlCenter')
    .eq(true)
    .and()
    .filter('region')
    .in(regions)
    .all()
    .exec();
  console.log({ locations });
  return respond(200, locations);
});

module.exports.health = async (event: any) => {
  return respond(200, 'ok');
};

// npm run invoke:updateAllBoxesPrograms
// module.exports.updateAllBoxesPrograms = RavenLambdaWrapper.handler(Raven, async event => {
//   const locations: Venue[] = await dbLocation.scan().exec();
//   // console.log({ location });
//   for (const location of locations) {
//     for (const box of location.boxes) {
//       if (box.live && box.live.channel) {
//         console.time('get program');
//         const programResult = await new Invoke()
//           .service('program')
//           .name('get')
//           .queryParams({ channel: box.live.channel, channelMinor: box.live.channelMinor, region: location.region })
//           .go();
//         const program = programResult && programResult.data;
//         console.timeEnd('get program');

//         console.time('update location box');
//         const boxIndex = location.boxes.findIndex(b => b.id === box.id);
//         console.log(location.id, boxIndex, box.live.channel, program.title);
//         await updateLocationBox(
//           location.id,
//           boxIndex,
//           box.live.channel,
//           box.live.channelMinor,
//           undefined,
//           program,
//           undefined,
//           undefined,
//           undefined,
//           undefined,
//           'updateAllBoxesPrograms',
//         );
//         console.timeEnd('update location box');
//       }
//     }
//   }
//   return respond(200);
// });

// module.exports.updateBoxInfo = RavenLambdaWrapper.handler(Raven, async event => {
//   const { id: locationId, boxId } = getPathParameters(event);
//   const body: BoxInfoRequest = getBody(event);
//   const { channel, channelMinor, source, channelChangeAt, lockedUntil, lockedProgrammingIds } = body;

//   console.log({ body });
//   console.time('get location');
//   const location: Venue = await dbLocation
//     .queryOne('id')
//     .eq(locationId)
//     .exec();
//   console.timeEnd('get location');
//   // console.log(location.name);

//   const boxIndex = location.boxes.findIndex(b => b.id === boxId);
//   console.log({ boxId, boxIndex });

//   console.time('get program');
//   // HACK adding one minute here so that if this is called at :58,
//   //  it'll get :00 program
//   const inTwoMinutesUnix =
//     moment()
//       .add(2, 'm')
//       .unix() * 1000;
//   const programResult = await new Invoke()
//     .service('program')
//     .name('get')
//     .queryParams({
//       channel,
//       channelMinor,
//       region: location.region,
//       time: inTwoMinutesUnix,
//     })
//     .go();
//   console.log({ programResult });
//   const program = programResult && programResult.data;
//   console.log({ program });
//   console.timeEnd('get program');

//   console.time('update location box');
//   console.log({
//     locationId,
//     boxIndex,
//     channel,
//     channelMinor,
//     source,
//     program,
//     channelChangeAt,
//   });
//   await updateLocationBox(
//     locationId,
//     boxIndex,
//     channel,
//     channelMinor,
//     source,
//     program,
//     channelChangeAt,
//     lockedUntil,
//     lockedProgrammingIds,
//     undefined,
//     'updateBoxInfo',
//   );
//   console.timeEnd('update location box');

//   return respond(200);
// });

class ControlCenterProgram {
  fields: {
    start: Date,
    rating: number,
    programmingId: string,
    title: string,
    targetingIds: string[],
    tuneEarly: number,
  };
  db: Program;
  constructor(obj: any) {
    Object.assign(this, obj);
  }
  isMinutesFromNow(minutes: number) {
    return moment(this.fields.start).diff(moment(), 'minutes') <= minutes;
  }
}

module.exports.controlCenter = RavenLambdaWrapper.handler(Raven, async event => {
  console.log(JSON.stringify({ event }));
  let locations: Venue[] = await dbLocation.scan().exec();
  locations = locations.filter(l => l.controlCenter === true);
  console.log(locations.map(l => l.name));
  const isHttp = !!event.httpMethod;
  if (isHttp) {
    console.log('1');
    await new Invoke()
      .service('program')
      .name('syncAirtableUpdates')
      .go();
  }
  console.log('2');
  for (const location of locations) {
    console.log('3');
    await new Invoke()
      .service('location')
      .name('controlCenterByLocation')
      .pathParams({ id: location.id })
      .async()
      .go();
  }
  return respond(200, { locations: locations.length });
});

function filterPrograms(ccPrograms: ControlCenterProgram[], location: Venue): ControlCenterProgram[] {
  const { boxes } = location;
  // remove if we couldnt find a match in the database
  ccPrograms = ccPrograms.filter(ccp => !!ccp.db);

  const currentlyShowingPrograms: BoxLive[] = boxes
    .filter(b => b.configuration && b.configuration.automationActive)
    .filter(b => b.live && b.live.channel)
    .map(b => b.live);
  console.log({ currentlyShowingPrograms });
  let ccProgramsFiltered = [];
  ccPrograms.forEach(ccp => {
    // if (cc)
    // if premium channel, check if has package
    let skip = false;
    allPackages.map(pkg => {
      // check if premium channel
      if (pkg.channels.includes(ccp.db.channel)) {
        // check if location has package
        const locationPackages = location.packages || [];
        if (!locationPackages.includes(pkg.name)) {
          console.log('skip');
          skip = true;
          return;
        }
      }
    });
    if (skip) return;
    const program: Program = ccp.db;

    // if there are two from the same channel, skip one (due to tuneEarly)
    const other = ccPrograms.find(p => {
      return p.db.channel === program.channel && !!p.fields.tuneEarly && p.fields.start !== ccp.fields.start;
    });
    if (other) {
      return;
    }

    if (!currentlyShowingPrograms.find(c => c.channel === program.channel && c.channelMinor === program.channelMinor)) {
      return ccProgramsFiltered.push(ccp);
    } else {
      // remove from array, in case of replication
      const index = currentlyShowingPrograms.findIndex(
        p => p.channel == program.channel && p.channelMinor == program.channelMinor,
      );
      if (index > -1) {
        currentlyShowingPrograms.splice(index, 1);
      }
    }
  });

  console.info(`filtered programs after looking at currently showing: ${ccProgramsFiltered.length}`);

  // remove channels that location doesn't have
  // const excludedChannels = [];
  // if (location.packages && location.packages.length) {
  //   location.packages.map(packageName => {
  //     excludedChannels.push(...allPackages.find(p => p.name === packageName).channels);
  //   });
  // }

  // if (excludedChannels && excludedChannels.length) {
  //   ccProgramsFiltered = ccProgramsFiltered.filter(ccp => !excludedChannels.includes(ccp.db.channel));
  // }
  console.info(`filtered programs after looking at excluded: ${ccProgramsFiltered.length}`);
  // sort by rating descending
  return ccProgramsFiltered.sort((a, b) => b.fields.rating - a.fields.rating);
}

// const priority = {
//   force: 'force', // force
//   worseRated: 'worse rating', // turn off game with worse rating
//   blowout: 'blowout', // blowout
//   // blowoutMajor: 4, // major blowout
//   gameOver: 'game over', // game over
// };

// npm run invoke:controlCenterByLocation
module.exports.controlCenterByLocation = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId } = getPathParameters(event);
  // const location: Venue = await dbLocation
  //   .queryOne('id')
  //   .eq(locationId)
  //   .exec();
  const location = await getLocationWithBoxes(locationId);
  console.info(`Running Control Center for: ${location.name} (${location.neighborhood})`);

  // get control center programs
  let ccPrograms: ControlCenterProgram[] = await getAirtablePrograms(location);
  const currentlyShowingProgrammingIds: string[] = location.boxes
    .filter(b => b.configuration && b.configuration.automationActive)
    .filter(b => b.live)
    .map(b => b.live.program && b.live.program.programmingId);
  const locationBoxesCount = location.boxes.filter(b => b.configuration && b.configuration.automationActive).length;
  console.info(`location boxes: ${locationBoxesCount}`);
  console.info(`all cc programs before replication: ${ccPrograms.length}`);
  ccPrograms = replicatePrograms(ccPrograms, locationBoxesCount);
  console.info(`all cc programs after replication: ${ccPrograms.length}`);
  if (!ccPrograms.length) {
    return respond(200, 'no programs');
  }

  // get programs from db from cc programs
  const { region } = location;
  // const { programmingId } = program.fields;
  const programmingIds = ccPrograms.map(p => p.fields.programmingId).join(',');
  console.log({ region, programmingIds });
  const programsResult = await new Invoke()
    .service('program')
    .name('get')
    .queryParams({ region, programmingIds })
    // .async()
    .go();
  const programs = programsResult && programsResult.data;

  // attach db program
  ccPrograms.map(ccp => {
    const program: Program = programs.find(p => p.programmingId === ccp.fields.programmingId);
    ccp.db = program;
  });

  // filter out currently showing programs, excluded programs, and sort by rating
  ccPrograms = filterPrograms(ccPrograms, location);

  // get boxes that are CC active, and not locked
  let availableBoxes: Box[] = getAvailableBoxes(location.boxes);
  console.log('availableBoxes', availableBoxes.length);
  console.log(JSON.stringify({ availableBoxes }));

  for (const program of ccPrograms) {
    let selectedBox: ?Box = null;
    console.info(`trying to turn on: ${program.fields.title} (${program.db.channel}) {${program.fields.rating}}`);
    // const isCloseHighlyRated = [10, 9].includes(program.fields.rating) && program.isMinutesFromNow(10);
    // const isCloseNotHighlyRated = [7, 6, 5, 4, 3, 2, 1].includes(program.fields.rating) && program.isMinutesFromNow(5);
    // if (isCloseHighlyRated || isCloseNotHighlyRated) {
    if (program.isMinutesFromNow(60)) {
      selectedBox = findBoxGameOver(availableBoxes);
      // if (!selectedBox) selectedBox = findBoxBlowout(availableBoxes);
      if (!selectedBox) selectedBox = findBoxWithoutRating(availableBoxes, program);
      if (!selectedBox) selectedBox = findBoxWorseRating(availableBoxes, program);
    } else {
      console.info('game is too far in future');
      continue;
    }
    if (selectedBox) {
      await tuneAutomation(location, selectedBox, program.db.channel, program.db.channelMinor, program.db);
      // remove box so it doesnt get reassigned
      console.log(`boxes: ${availableBoxes.length}`);
      availableBoxes = availableBoxes.filter(b => b.id !== (selectedBox && selectedBox.id));
      console.log(`boxes remaining: ${availableBoxes.length}`);
    } else {
      console.info('could not find box to put program on');
    }
    if (!availableBoxes.length) {
      console.info('no more boxes');
      break;
    }
  }
  return respond(200);
});

// npm run invoke:updateAirtableNowShowing
module.exports.updateAirtableNowShowing = RavenLambdaWrapper.handler(Raven, async event => {
  let locations: Venue[] = await dbLocation
    .scan()
    .filter('active')
    .eq(true)
    .and()
    .filter('controlCenter')
    .eq(true)
    .all()
    .exec();
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtableName = 'Now Showing';
  const nowShowing = [];
  locations.forEach(location => {
    nowShowing.push(...buildAirtableNowShowing(location));
  });
  console.log('nowShowing:', nowShowing.length);
  const promises = [];
  while (!!nowShowing.length) {
    const slice = nowShowing.splice(0, 10);
    promises.push(base(airtableName).create(slice));
  }
  try {
    await Promise.all(promises);
  } catch (e) {
    console.error(e);
  }
  return respond(200);
});

module.exports.getLocationDetailsPage = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);
  console.time('get location');
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();
  console.timeEnd('get location');
  const boxes = location.boxes
    .filter(box => !!box.configuration.automationActive || !!box.configuration.appActive)
    .sort((a, b) => (a.zone || b.label || '').localeCompare(b.zone || b.label || ''));

  console.time('get upcoming programs');
  let { data: upcomingPrograms } = await new Invoke()
    .service('program')
    .name('upcoming')
    .body({ location })
    .headers(event.headers)
    .go();
  console.timeEnd('get upcoming programs');

  console.time('mappin');
  upcomingPrograms.map(p => {
    if (p.fields.rating >= 8) {
      p.highlyRated = true;
    }
    return (p.fromNow = moment(p.fields.start)
      .tz('America/New_York')
      .fromNow());
  });
  const currentProgrammingIds = location.boxes
    .filter(b => !!b.live)
    .filter(b => !!b.live.program)
    .map(b => b.live.program.programmingId);
  console.log({ upcomingPrograms });
  upcomingPrograms = upcomingPrograms.filter(p => !currentProgrammingIds.includes(p.fields.programmingId));
  const template = `\
    <section> \
    <h3>{{location.name}} ({{location.neighborhood}})</h4> \
    <h4>Now Showing:</h4> \
      <ul> \
      {{#boxes}} \
        <li> \
          {{live.program.channelTitle}} <em>{{live.program.title}}</em> \
        </li> \
      {{/boxes}} \
      </ul> \ 
    </section> \  
    <section> \
      <h4>Upcoming:</h4> \
      <ul> \
        {{#upcomingPrograms}} \
          <li> \
            {{#highlyRated}}<b>{{/highlyRated}} \
            {{fields.channelTitle}}: {{fields.title}} \
            {{#highlyRated}}</b>{{/highlyRated}} \
            <em>({{fromNow}})</em> \
          </li> \
        {{/upcomingPrograms}} \
        {{^upcomingPrograms}} \
          Check back soon for upcoming games.
        {{/upcomingPrograms}} \
      </ul> \
    </section> \
  `;
  const html = mustache.render(template, { location, boxes, upcomingPrograms });
  console.timeEnd('mappin');
  return respond(200, { html });
});

async function migrateNullToVersion1(version?: number) {
  const locations: Venue[] = await dbLocation
    .scan()
    .filter('_v')
    .null()
    .exec();
  const promises = [];
  locations.forEach(location => {
    location._v = 1;
    promises.push(location.save());
  });
  await Promise.all(promises);
}

async function migrateLocationsToVersion2(version?: number) {
  const locations: Venue[] = await dbLocation
    .scan()
    .filter('_v')
    .eq(1)
    .exec();
  console.log('v1 locations', locations.length);
  const promises = [];
  locations.forEach(location => {
    location.boxes = location.boxes.map((b: any) => {
      const newBox = {
        id: b.id,
        label: b.label,
        zone: b.zone,
        configuration: {
          appActive: b.appActive,
          automationActive: b.controlCenter,
        },
        info: {
          ip: b.ip,
          clientAddress: b.clientAddress,
        },
        live: {
          channel: b.channel,
        },
      };
      return newBox;
    });
    if (location.controlCenterV2) {
      location.controlCenter = true;
    } else {
      location.controlCenter = false;
    }
    location.controlCenterV2 = null;
    location._v = 2;
    console.log(location.boxes);
    promises.push(location.save());
  });
  await Promise.all(promises);
}

module.exports.migration = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('-_%^#$@+$(%     running db migrations     -_%^#$@+$(%');

  await migrateNullToVersion1();
  await migrateLocationsToVersion2();

  return respond();
});

module.exports.syncLocationsBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  const { data: allRegions } = await new Invoke()
    .service('program')
    .name('regions')
    .go();
  const allRegionIds = allRegions.map(r => r.id);

  const { data: locations }: { data: Venue[] } = await new Invoke()
    .service('location')
    .name('controlCenterLocationsByRegion')
    .pathParams({ regions: allRegionIds })
    .headers(event.headers)
    .go();
  for (location of locations) {
    const { losantId, losantProductionOverride } = location;
    console.log(`sync box (${location.name}):`, { losantId, losantProductionOverride });
    await new Invoke()
      .service('remote')
      .name('syncWidgetBoxes')
      .body({ losantId, losantProductionOverride })
      .async()
      .go();
    // const text = `Boxes Synced @ ${location.name} (${location.neighborhood})`;
    // await new Invoke()
    //   .service('notification')
    //   .name('sendAntenna')
    //   .body({ text })
    //   .async()
    //   .go();
  }
  return respond(200);
});

module.exports.slackSlashChangeChannel = RavenLambdaWrapper.handler(Raven, async event => {
  console.log({ event });
  const body = getBody(event);
  const queryData = url.parse('?' + body, true).query;
  const [locationShortId, tvString, channel, channelMinor] = queryData.text.split(' ');
  console.log({ locationShortId, tvString, channel, channelMinor });
  const locationPartial: Venue = await dbLocation
    .queryOne('shortId')
    .eq(locationShortId)
    .exec();
  if (!locationPartial) {
    return respond(200, 'location not found');
  }
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationPartial.id)
    .exec();
  // const zone = .substring(1,3)
  const zone = tvString.charAt(0) === 'z' && tvString.substring(1, tvString.length);
  const label = tvString.charAt(0) === 'l' && tvString.substring(1, tvString.length);
  let box;
  console.log({ zone, label });
  if (zone) {
    box = location.boxes.find(b => b.zone === zone);
  } else if (label) {
    box = location.boxes.find(b => b.label === label);
  }

  console.log(location, box, channel, channelMinor);
  await tuneSlackZap(location, box, channel, channelMinor);
  return respond(200, `[${location.name}] channel zapped to ${channel} ${channelMinor ? channelMinor : ''}`);
});

module.exports.slackSlashLocationsSearch = RavenLambdaWrapper.handler(Raven, async event => {
  console.time('function');
  const body = getBody(event);
  console.log({ event });
  const queryData = url.parse('?' + body, true).query;
  const searchTerm = queryData.text;
  console.log({ searchTerm });
  console.time('query');
  let locations: Venue[] = await dbLocation.scan().exec();
  console.timeEnd('query');
  console.log({ locations });

  if (!!searchTerm) {
    locations = locations.filter(l => l.name.toLowerCase().includes(searchTerm));
  }
  console.time('create message');
  let responseText = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n';
  locations.forEach(location => {
    responseText += `${location.name} (${location.neighborhood})\n`;
    responseText += `${location.shortId}\n`;
    location.boxes = location.boxes.map(b => setBoxStatus(b));
    location.boxes
      .filter(box => box.configuration.automationActive || box.configuration.appActive)
      .sort((a, b) => (a.zone || a.label).localeCompare(b.zone || b.label))
      .forEach(box => {
        const { channel, channelMinor } = box.live && box.live;
        const program = box.live && box.live.program;
        responseText += `\t`;
        responseText += `\t${box.live && box.live.locked ? '[locked]' : ''}\n`;
        if (box.configuration.automationActive) {
          responseText += `\tzone ${box.zone}`;
        }
        if (box.configuration.appActive) {
          responseText += `\tlabel ${box.label}`;
        }
        if (program && program.title) {
          responseText += ` *${program.channelTitle}*: ${program.title.substring(0, 8)}`;
        } else {
          responseText += '\t\t';
        }
        responseText += `\t${channel}[${channelMinor || ''}]`;
      });
    responseText += '\n\n';
  });
  console.timeEnd('create message');
  console.log(responseText);
  const response = respond(200);
  response.body = responseText;
  console.timeEnd('function');
  return response;
});

module.exports.slackSlashControlCenter = RavenLambdaWrapper.handler(Raven, async event => {
  const body = getBody(event);
  const queryData = url.parse('?' + body, true).query;
  const [action, locationShortId] = queryData.text.split(' ');
  const location: Venue = await dbLocation
    .queryOne('shortId')
    .eq(locationShortId)
    .exec();
  if (!location) {
    return respond(200, 'location not found');
  }

  switch (action) {
    case 'enable': {
      const locationEnabled = await dbLocation.update(
        { id: location.id },
        { controlCenter: true },
        {
          returnValues: 'ALL_NEW',
        },
      );
      const text = `control center enabled at ${locationEnabled.name}`;
      await new Invoke()
        .service('notification')
        .name('sendControlCenter')
        .body({ text })
        .async()
        .go();
      return respond(200, text);
    }
    case 'disable': {
      const locationDisabled = await dbLocation.update(
        { id: location.id },
        { controlCenter: false },
        {
          returnValues: 'ALL_NEW',
        },
      );
      const text = `control center disabled at ${locationDisabled.name}`;
      await new Invoke()
        .service('notification')
        .name('sendControlCenter')
        .body({ text })
        .async()
        .go();
      return respond(200, text);
    }
    default:
      return respond(400, 'unknown action');
  }
});

function buildAirtableNowShowing(location: Venue) {
  const transformed = [];
  location.boxes.forEach(box => {
    const { zone, label } = box;
    const { appActive } = box.configuration;
    const { channel, channelChangeSource: source, program } = box.live;
    let game, programTitle, rating;
    if (program) {
      game = program.game;
      console.log(game);
      programTitle = program.title;
      rating = program.clickerRating;
      if (program.description) {
        programTitle += `: ${program.description.substring(0, 20)}`;
      }
    }
    transformed.push({
      fields: {
        location: `${location.name}: ${location.neighborhood}`,
        program: programTitle ? programTitle : '',
        game: game ? JSON.stringify(game) : '',
        rating: rating,
        channel,
        channelName: program ? program.channelTitle : null,
        source,
        zone: zone ? zone : appActive ? `${label} (app)` : '',
        time: moment().toDate(),
      },
    });
  });
  return transformed;
}

function getAvailableBoxes(boxes: Box[]): Box[] {
  console.log({ boxes });
  boxes = boxes.map(b => setBoxStatus(b));
  boxes = boxes.filter(b => b.configuration.automationActive);
  // return if automation locked as we still want to evaluate those
  boxes = boxes.filter(b => !b.live.locked || (b.live.locked && b.live.channelChangeSource === zapTypes.automation));
  return boxes;
}

async function tuneSlackZap(location: Venue, box: Box, channel: number, channelMinor: number) {
  const command = 'tune';
  const reservation = {
    location,
    box,
    program: {
      channel,
      channelMinor,
    },
  };
  const source = zapTypes.automation;
  console.log('box', reservation.box);
  console.log(`-_-_-_-_-_-_-_-_-_ tune to ${channel} [slack zap]`);
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source, losantProductionOverride: location.losantProductionOverride })
    .async()
    .go();
}

async function tuneAutomation(location: Venue, box: Box, channel: number, channelMinor: number, program: Program) {
  const command = 'tune';
  const reservation = {
    location,
    box,
    program: {
      ...program,
      channel,
      channelMinor,
    },
  };
  const source = zapTypes.automation;
  console.log(`-_-_-_-_-_-_-_-_-_ tune to ${channel}`, box.label);
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source, losantProductionOverride: location.losantProductionOverride })
    .async()
    .go();
}

function findBoxGameOver(boxes: Box[]): ?Box {
  console.info('findBoxGameOver');
  return boxes
    .filter(b => b.live)
    .filter(b => b.live.program)
    .filter(b => b.live.program.game)
    .find(b => b.live.program.game.summary.ended);
}

function findBoxBlowout(boxes: Box[]): ?Box {
  console.info('findBoxBlowout');
  return boxes
    .filter(b => b.live)
    .filter(b => b.live.program)
    .filter(b => b.live.program.game)
    .find(b => b.live.program.game.summary.blowout);
}

function findBoxWithoutRating(boxes: Box[], program: ControlCenterProgram): ?Box {
  console.info('findBoxWithoutRating');
  return boxes
    .filter(b => b.live)
    .filter(b => b.live.program)
    .find(b => !b.live.program.clickerRating);
}

function findBoxWorseRating(boxes: Box[], program: ControlCenterProgram): ?Box {
  console.info('findBoxWorseRating');
  const ratingBuffer = 2;
  const sorted = boxes
    .filter(b => b.live)
    .filter(b => b.live.program)
    .filter(b => b.live.program.clickerRating)
    .filter(b => program.fields.rating - b.live.program.clickerRating >= ratingBuffer)
    .sort((a, b) => a.live.program.clickerRating - b.live.program.clickerRating);
  return sorted && sorted.length ? sorted[0] : null;
}

function replicatePrograms(
  ccPrograms: ControlCenterProgram[],
  boxesCount: number,
  // currentlyShowingProgrammingIds: string[] = [],
): ControlCenterProgram[] {
  let programsWithReplication = [];
  ccPrograms.forEach(ccp => {
    if ([10, 9, 8].includes(ccp.fields.rating)) {
      let replicationCount = 0;
      if (ccp.fields.rating === 10) {
        replicationCount = boxesCount;
      } else if (ccp.fields.rating === 9) {
        replicationCount = Math.floor(boxesCount * 0.67);
      } else if (ccp.fields.rating === 8) {
        replicationCount = Math.floor(boxesCount * 0.34);
      }
      console.log({ replicationCount });
      // subtract another if channel already on
      // if (currentlyShowingProgrammingIds.includes(ccp.fields.programmingId)) {
      //   const existingCount = currentlyShowingProgrammingIds.filter(pid => pid === ccp.fields.programmingId).length;
      //   console.log({ existingCount });
      //   replicationCount = replicationCount - existingCount;
      //   console.log({ replicationCount });
      // }
      // subtract one because its already in there once
      for (let i = 0; i < replicationCount; i++) {
        programsWithReplication.push(ccp);
      }
    } else {
      programsWithReplication.push(ccp);
    }
  });
  console.log(JSON.stringify({ programsWithReplication }));
  return programsWithReplication;
}

async function getAirtablePrograms(location: Venue): Promise<ControlCenterProgram[]> {
  const airtableProgramsName = 'Control Center';
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  let ccPrograms: ControlCenterProgram[] = await base(airtableProgramsName)
    .select({
      filterByFormula: `AND( 
        {rating} != BLANK(),
        {isOver} != 'Y',
        {startHoursFromNow} >= -4,
        {startHoursFromNow} <= 1,
        {isReady} != 0
      )`,
    })
    .all();
  console.log({ location });
  console.log({ ccPrograms });
  ccPrograms = filterProgramsByTargeting(ccPrograms, location);
  const ccProgramModels: ControlCenterProgram[] = ccPrograms.map(p => new ControlCenterProgram(p));
  return ccProgramModels;
}

// remove programs not targeted at this location
function filterProgramsByTargeting(ccPrograms: ControlCenterProgram[], location: Venue): ControlCenterProgram[] {
  ccPrograms = ccPrograms.filter(ccp => {
    const targetingRegionIds =
      ccp.fields.targetingIds && ccp.fields.targetingIds.length
        ? ccp.fields.targetingIds.filter(str => str.startsWith('region:')).map(str => str.replace('region:', ''))
        : [];
    const targetingLocationIds =
      ccp.fields.targetingIds && ccp.fields.targetingIds.length
        ? ccp.fields.targetingIds.filter(str => str.startsWith('location:')).map(str => str.replace('location:', ''))
        : [];
    const isTargetedRegion = targetingRegionIds.includes(location.region);
    const isTargetedLocation = targetingLocationIds.includes(location.id);
    if (targetingRegionIds.length && targetingLocationIds.length) {
      return targetingRegionIds.includes(location.region) || targetingLocationIds.includes(location.id);
    } else if (targetingRegionIds.length) {
      return targetingRegionIds.includes(location.region);
    } else if (targetingLocationIds.length) {
      return targetingLocationIds.includes(location.id);
    }
    return true;
  });

  // return ccPrograms;

  // remove duplicates if targeted more than once

  // only iterate over uniques, but search all
  const uniques: ControlCenterProgram[] = [];
  const uniquesMap = new Map();
  for (const item of ccPrograms) {
    if (!uniquesMap.has(item.fields.programmingId)) {
      uniquesMap.set(item.fields.programmingId, true);
      uniques.push(item);
    }
  }

  // console.log('uniques', uniques);
  const results = [];
  uniques.forEach(ccp => {
    const duplicates: ControlCenterProgram[] =
      ccPrograms.filter(ccp2 => ccp2.fields.programmingId === ccp.fields.programmingId) || [];
    if (duplicates.length) {
      const a = duplicates.find(
        d => d.fields.targetingIds && d.fields.targetingIds.find(str => str.startsWith('location:')),
      );
      const b = duplicates.find(
        d => d.fields.targetingIds && d.fields.targetingIds.find(str => str.startsWith('region:')),
      );
      const c = duplicates[0];
      const winner: ControlCenterProgram = a || b || c;
      results.push(winner);
    } else {
      results.push(ccp);
    }
  });
  return results;
}

async function updateLocationBox(
  locationId,
  boxIndex,
  channel: number,
  channelMinor?: number,
  source?: string,
  program: Program,
  channelChangeAt?: number,
  lockedUntil?: number,
  lockedProgrammingIds?: string[],
  removeLockedUntil?: boolean,
  updatedSource: string,
) {
  const AWS = require('aws-sdk');
  const docClient = new AWS.DynamoDB.DocumentClient();
  const now = moment().unix() * 1000;
  let updateExpression = `set `;
  let removeExpression = '';
  let expressionAttributeValues = {};
  const prefix = `boxes[${boxIndex}].live`;
  console.log({ channel, channelMinor });
  if (channel) {
    updateExpression += `${prefix}.channel = :channel,`;
    expressionAttributeValues[':channel'] = parseInt(channel);
  }
  if (Number.isInteger(channelMinor)) {
    updateExpression += `${prefix}.channelMinor = :channelMinor,`;
    expressionAttributeValues[':channelMinor'] = parseInt(channelMinor);
  } else {
    removeExpression += `REMOVE ${prefix}.channelMinor`;
  }
  if (channelChangeAt) {
    updateExpression += `${prefix}.channelChangeAt = :channelChangeAt,`;
    expressionAttributeValues[':channelChangeAt'] = channelChangeAt;
  }
  if (source) {
    updateExpression += `${prefix}.channelChangeSource = :channelChangeSource,`;
    expressionAttributeValues[':channelChangeSource'] = source;
  }
  if (program) {
    updateExpression += `${prefix}.program = :program,`;
    expressionAttributeValues[':program'] = program;
  }
  if (lockedUntil) {
    updateExpression += `${prefix}.lockedUntil = :lockedUntil,`;
    expressionAttributeValues[':lockedUntil'] = lockedUntil;
  }
  if (lockedProgrammingIds) {
    updateExpression += `${prefix}.lockedProgrammingIds = :lockedProgrammingIds,`;
    expressionAttributeValues[':lockedProgrammingIds'] = lockedProgrammingIds;
  }
  if (removeLockedUntil) {
    updateExpression += `${prefix}.lockedUntil = :lockedUntilRemove,`;
    expressionAttributeValues[':lockedUntilRemove'] = null;
  }
  updateExpression += `boxes[${boxIndex}].updatedAt = :updatedAt,`;
  expressionAttributeValues[':updatedAt'] = now;
  updateExpression += `boxes[${boxIndex}].updatedSource = :updatedSource`;
  expressionAttributeValues[':updatedSource'] = updatedSource;
  console.log(expressionAttributeValues);
  var params = {
    TableName: process.env.tableLocation,
    Key: { id: locationId },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: updateExpression + ' ' + removeExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  // console.log('calling...');
  console.log('params', JSON.stringify(params));
  // console.log('returned');
  try {
    const x = await docClient.update(params).promise();
    console.log('db result:', JSON.stringify(x));
  } catch (err) {
    console.log({ err });
    return err;
  }
  return;
}

module.exports.ControlCenterProgram = ControlCenterProgram;
module.exports.getAvailableBoxes = getAvailableBoxes;
module.exports.filterPrograms = filterPrograms;
module.exports.findBoxGameOver = findBoxGameOver;
module.exports.findBoxBlowout = findBoxBlowout;
module.exports.findBoxWithoutRating = findBoxWithoutRating;
module.exports.findBoxWorseRating = findBoxWorseRating;
module.exports.filterProgramsByTargeting = filterProgramsByTargeting;
module.exports.replicatePrograms = replicatePrograms;
module.exports.setBoxStatus = setBoxStatus;
