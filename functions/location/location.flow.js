// @flow
const { respond, getBody, getPathParameters, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const geolib = require('geolib');
const moment = require('moment-timezone');
// const momentHelper = require('helper-moment');
const mustache = require('mustache');
const uuid = require('uuid/v1');
const Airtable = require('airtable');
// const awsXRay = require('aws-xray-sdk');
// const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
let AWS;
if (!process.env.IS_LOCAL) {
  AWS = require('aws-xray-sdk').captureAWS(require('aws-sdk'));
} else {
  console.info('Serverless Offline detected; skipping AWS X-Ray setup');
  AWS = require('aws-sdk');
}

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
    boxes: [
      {
        id: String,
        clientAddress: String, // dtv calls this clientAddr
        locationName: String, // dtv name
        label: String, // physical label id on tv (defaults to locationName)
        // tunerBond: Boolean, // not sure what this is
        setupChannel: Number,
        ip: String,
        reserved: Boolean,
        end: Date,
        zone: String,
        notes: String,
        appActive: Boolean,
        channel: Number,
        channelMinor: Number,
        channelChangeAt: Date,
        updatedAt: Date,
        // program: Map, // populated every few minutes
        channelSource: {
          type: String,
          enum: ['app', 'control center', 'manual', 'control center daily'],
        },
      },
    ],
    // boxesV2: [
    //   {
    //     id: String,
    //     about: {
    //       clientAddress: String, // dtv calls this clientAddr
    //       locationName: String, // dtv name
    //       label: String, // physical label id on tv (defaults to locationName)
    //       setupChannel: Number,
    //       ip: String,
    //       notes: String,
    //     },
    //     controlCenter: {
    //       zone: String,
    //     },
    //     userControl: {
    //       // clicker tv app
    //       active: Boolean, // formerly appActive
    //       reserved: Boolean,
    //       end: Date,
    //     },
    //     current: {
    //       channel: Number,
    //       channelChangeAt: Date,
    //       updatedAt: Date,
    //       channelSource: {
    //         type: String,
    //         enum: ['app', 'control center', 'manual', 'control center daily'],
    //       },
    //     },
    //   },
    // ],

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
    // zip: { type: String, required: true },
    geo: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    demo: Boolean,
    free: Boolean,
    img: String,
    region: String,
    active: Boolean,
    hidden: Boolean,
    connected: Boolean,
    setup: Boolean,
    controlCenter: Boolean,
    controlCenterV2: Boolean,
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
  const { partner, clicker, app } = event.headers;
  console.log({ partner, clicker, app });
  console.time('entire');
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
      l.openTvs = l.boxes.every(b => !b.reserved || moment(b.end).diff(moment().toDate()) < 0);
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
  if (milesRadius && latitude && longitude) {
    allLocations = allLocations.filter(l => l.distance <= milesRadius);
  }
  console.log('locations after geo', allLocations.length);
  const sorted = allLocations.sort((a, b) => (a.distance < b.distance ? -1 : 1));
  console.timeEnd('entire');
  console.log('returning', sorted.length);
  return respond(200, sorted);
});

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);

  console.time('get from db');
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();
  console.timeEnd('get from db');

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
    let updated = false;
    location.boxes.forEach((o, i, boxes) => {
      // check if box is reserved and end time is in past
      if (boxes[i].reserved && moment(boxes[i].end).diff(moment().toDate()) < 0) {
        boxes[i].reserved = false;
        updated = true;
      }
    });
    console.timeEnd('update reserved status');
    if (updated) {
      console.time('save boxes');
      await location.save();
      console.timeEnd('save boxes');
    }

    console.time('filter + sort');
    if (event.headers && event.headers.app && event.headers.app.length) {
      location.boxes = location.boxes.filter(b => b.appActive);
    }

    // filter out inactive boxes
    // sort boxes alphabetically
    location.boxes = location.boxes.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
    console.timeEnd('filter + sort');
  }

  // delete location.losantId;

  // set distance
  console.time('set geo distance');
  if (event.queryStringParameters) {
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

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const body = getBody(event);
    console.log(body);
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
  const { boxes, ip } = getBody(event);
  console.log({ boxes, ip });
  const { id } = getPathParameters(event);

  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();

  if (location.setup) {
    return respond(204, 'location has already been setup');
  }

  let updatedLocation;
  location.boxes = location.boxes || [];
  for (const box of boxes) {
    box.clientAddress = box.clientAddr;
    box.ip = ip;
    const existingBox =
      location.boxes &&
      location.boxes.find(locationBox => locationBox.ip === box.ip && locationBox.clientAddress === box.clientAddress);
    if (!existingBox) {
      box.id = uuid();
      // box.active = true;
      // set label to locationName or random 2 alphanumeric characters
      box.label =
        box.locationName ||
        Math.random()
          .toString(36)
          .substr(2, 2);
      console.log('add new box!', box.ip);
      await dbLocation.update({ id }, { $ADD: { boxes: [box] } });
      // location.boxes.push(box);
      const text = `*New DirecTV Box Added* @ ${location.name} (${location.neighborhood}): ${box.id}`;
      await new Invoke()
        .service('notification')
        .name('sendAntenna')
        .body({ text })
        .async()
        .go();
      await new Invoke()
        .service('notification')
        .name('sendTasks')
        .body({ text, importance: 1 })
        .async()
        .go();
    } else {
      console.log('existing box', box.ip);
    }
  }

  return respond(201, updatedLocation);
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

module.exports.syncAirtableLocations = RavenLambdaWrapper.handler(Raven, async event => {
  const dbLocations: Venue[] = await dbLocation.scan().exec();
  const airtableDataTable = 'Data';
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtableLocations = await base(airtableDataTable)
    .select({
      filterByFormula: `{type} = 'location'`,
    })
    .all();
  const airtableLocationIds: string[] = airtableLocations.map(l => l.fields.id);
  const newLocations = dbLocations.filter(dbLocation => {
    return !airtableLocationIds.includes(dbLocation.id);
  });
  let count = 0;
  if (newLocations && newLocations.length) {
    const promises = [];
    newLocations.forEach(newLocation => {
      count++;
      promises.push(
        base(airtableDataTable).create({
          id: newLocation.id,
          type: 'location',
          name: `${newLocation.name}: ${newLocation.neighborhood}`,
        }),
      );
    });
    await Promise.all(promises);
  }
  return respond(200, { count });
});

module.exports.setBoxReserved = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId, boxId } = getPathParameters(event);
  const { end } = getBody(event);

  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationId)
    .exec();

  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  location.boxes[boxIndex].reserved = true;
  location.boxes[boxIndex].end = end;
  await location.save();

  return respond(200);
});

module.exports.setBoxFree = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId, boxId } = getPathParameters(event);

  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationId)
    .exec();

  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  location.boxes[boxIndex].reserved = false;
  // location.boxes[boxIndex].end;
  await location.save();

  return respond(200);
});

// called from antenna
module.exports.saveBoxesInfo = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId } = getPathParameters(event);
  const { boxes } = getBody(event);
  console.log(boxes);
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationId)
    .exec();
  console.log({ location });

  for (const box of boxes) {
    const { boxId, info } = box;
    console.log(boxId, info);

    const { major, minor } = info;

    const i: number = location.boxes.findIndex(b => b.id === boxId);
    console.log('box', location.boxes[i], major, minor);
    const originalChannel = location.boxes[i].channel;
    console.log('original channel', originalChannel);
    console.log('current channel', major);

    let updateBoxInfoBody: any = {
      channel: major,
      channelMinor: minor,
    };
    if (originalChannel !== major) {
      updateBoxInfoBody.source = 'manual';
      updateBoxInfoBody.channelChangeAt = moment().unix() * 1000;
    }

    await new Invoke()
      .service('location')
      .name('updateBoxInfo')
      .body(updateBoxInfoBody)
      .pathParams({ id: location.id, boxId })
      .async()
      .go();

    // if channel is different and is a control center box
    //  - track via analytics

    if (originalChannel !== major) {
      const userId = 'system';
      const name = 'Manual Zap';
      const data = {
        from: originalChannel,
        to: major,
        locationId: location.id,
        locationName: location.name,
        locationNeighborhood: location.neighborhood,
      };
      await new Invoke()
        .service('analytics')
        .name('track')
        .body({ userId, name, data })
        .async()
        .go();

      // if control center or app box
      //  - send slack notif
      //  - send to airtable sheet
      if (!!location.boxes[i].zone || location.boxes[i].appActive) {
        const text = `Manual Zap @ ${location.name} (${
          location.neighborhood
        }) from *${originalChannel}* to *${major}* (Zone ${location.boxes[i].zone})`;

        await new Invoke()
          .service('notification')
          .name('sendControlCenter')
          .body({ text })
          .async()
          .go();
        // await new Invoke().service('notification').name('sendTasks').body({ text, importance: 1 }).async().go();
        console.log({ channel: major, region: location.region });
        const programResult = await new Invoke()
          .service('program')
          .name('get')
          .queryParams({ channel: major, region: location.region })
          .go();
        const program = programResult && programResult.data;
        console.log({ program });
        await new Invoke()
          .service('admin')
          .name('logChannelChange')
          .body({
            location,
            box: location.boxes[i],
            program,
            time: new Date(),
            type: name,
          })
          .async()
          .go();
      }
    }
  }

  return respond(200);
});

module.exports.setLabels = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);
  const boxesWithLabels = getBody(event);
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();
  const { boxes } = location;
  console.log(boxes, boxesWithLabels);
  const updatedBoxes = boxes.map(x => Object.assign(x, boxesWithLabels.find(y => y.setupChannel == x.setupChannel)));
  console.log(updatedBoxes);
  await dbLocation.update({ id }, { boxes: updatedBoxes }, { returnValues: 'ALL_NEW' });

  return respond(200, boxes);
});

module.exports.identifyBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);

  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();
  const { boxes } = location;
  let setupChannel = 801; // first music channel
  for (const box of boxes) {
    box.setupChannel = setupChannel;
    setupChannel++;
    const command = 'tune';
    const reservation = {
      location,
      box,
      program: {
        channel: box.setupChannel,
      },
    };
    await new Invoke()
      .service('remote')
      .name('command')
      .body({ reservation, command })
      .async()
      .go();
  }
  await dbLocation.update({ id }, { boxes });
  return respond(200, `hello`);
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

    const text = `Antenna Connected @ ${location.name} (${location.neighborhood})`;
    await new Invoke()
      .service('notification')
      .name('sendAntenna')
      .body({ text })
      .async()
      .go();
  }

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

    const text = `Antenna Disconnected @ ${location.name} (${location.neighborhood})`;
    await new Invoke()
      .service('notification')
      .name('sendAntenna')
      .body({ text })
      .async()
      .go();
  }

  return respond(200, 'ok');
});

// module.exports.allOff = RavenLambdaWrapper.handler(Raven, async event => {
//   const { id } = getPathParameters(event);

//   const location: Venue = await dbLocation
//     .queryOne('id')
//     .eq(id)
//     .exec();
//   const { boxes } = location;
//   for (const box of boxes) {
//     const command = 'key';
//     const key = 'poweroff';
//     const reservation = {
//       location,
//       box,
//       program: {
//         // channel: box.setupChannel,
//       },
//     };
//     console.log('turning off box', box);
//     await new Invoke()
//       .service('remote')
//       .name('command')
//       .body({ reservation, command, key })
//       .async()
//       .go();
//     console.log('turned off box', box);
//   }
//   return respond(200, 'ok');
// });

// module.exports.allOn = RavenLambdaWrapper.handler(Raven, async event => {
//   const { id } = getPathParameters(event);

//   const location: Venue = await dbLocation
//     .queryOne('id')
//     .eq(id)
//     .exec();
//   const { boxes } = location;
//   for (const box of boxes) {
//     const command = 'key';
//     const key = 'poweron';
//     const reservation = {
//       location,
//       box,
//       program: {
//         // channel: box.setupChannel,
//       },
//     };
//     console.log('turning on box', box);
//     await new Invoke()
//       .service('remote')
//       .name('command')
//       .body({ reservation, command, key })
//       .headers(event.headers)
//       .async()
//       .go();
//     console.log('turned on', box);
//   }
//   return respond(200, 'ok');
// });

module.exports.checkAllBoxesInfo = RavenLambdaWrapper.handler(Raven, async event => {
  // const { id } = getPathParameters(event);
  let allLocations: Venue[] = await dbLocation.scan().exec();

  let i = 0;
  for (const location of allLocations) {
    console.log(i);
    const { losantId } = location;
    const body = {
      losantId,
      boxes: [],
    };
    if (location.boxes) {
      for (const box of location.boxes) {
        const { id: boxId, ip, clientAddress: client } = box;
        body.boxes.push({ boxId, ip, client });
      }
      console.log('location.boxes', location.boxes.length);
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
module.exports.updateAllBoxesPrograms = RavenLambdaWrapper.handler(Raven, async event => {
  const locations: Venue[] = await dbLocation.scan().exec();
  for (const location of locations) {
    for (const box of location.boxes) {
      if (box.channel) {
        console.time('get program');
        const programResult = await new Invoke()
          .service('program')
          .name('get')
          .queryParams({ channel: box.channel, region: location.region })
          .go();
        const program = programResult && programResult.data;
        console.timeEnd('get program');

        console.time('update location box');
        const boxIndex = location.boxes.findIndex(b => b.id === box.id);
        console.log(location.id, boxIndex, box.channel, program.title);
        await updateLocationBox(location.id, boxIndex, box.channel, undefined, undefined, program);
        console.timeEnd('update location box');
      }
    }
  }
});

module.exports.updateBoxInfo = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId, boxId } = getPathParameters(event);
  const { channel, channelMinor, source, channelChangeAt } = getBody(event);

  console.time('get location');
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationId)
    .exec();
  console.timeEnd('get location');

  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  console.log({ boxId, boxIndex });

  console.time('get program');
  // HACK adding one minute here so that if this is called at :58,
  //  it'll get :00 program
  const inTwoMinutesUnix =
    moment()
      .add(2, 'm')
      .unix() * 1000;
  const programResult = await new Invoke()
    .service('program')
    .name('get')
    .queryParams({
      channel: channel,
      region: location.region,
      time: inTwoMinutesUnix,
    })
    .go();
  const program = programResult && programResult.data;
  console.log({ program });
  console.timeEnd('get program');

  console.time('update location box');
  console.log({
    locationId,
    boxIndex,
    channel,
    channelMinor,
    source,
    program,
    channelChangeAt,
  });
  await updateLocationBox(locationId, boxIndex, channel, channelMinor, source, program, channelChangeAt);
  console.timeEnd('update location box');

  return respond(200);
});

class ControlCenterProgram {
  fields: {
    start: Date,
    rating: number,
    programmingId: string,
    title: string,
    // channel: number, // do not use (region specific)
  };
  db: Program;
  constructor(obj: any) {
    Object.assign(this, obj);
  }
  isMinutesFromNow(minutes: number) {
    return moment(this.fields.start).diff(moment(), 'minutes') <= minutes;
  }
}

module.exports.controlCenterV2 = RavenLambdaWrapper.handler(Raven, async event => {
  let locations: Venue[] = await dbLocation.scan().exec();
  locations = locations.filter(l => l.controlCenterV2 === true);
  console.log(locations.map(l => l.name));
  for (const location of locations) {
    await new Invoke()
      .service('location')
      .name('controlCenterV2byLocation')
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

  const currentlyShowingChannels: number[] = boxes.filter(b => !!b.zone).map(b => b.channel);
  ccPrograms = ccPrograms.filter(ccp => !currentlyShowingChannels.includes(ccp.db.channel));
  console.info(`filtered programs after looking at currently showing: ${ccPrograms.length}`);

  // remove channels that location doesnt have
  const excludedChannels =
    location.channels && location.channels.exclude && location.channels.exclude.map(channel => parseInt(channel, 10));
  // console.info({
  //   excludedChannels: !!excludedChannels ? excludedChannels : [],
  // });

  if (excludedChannels && excludedChannels.length) {
    ccPrograms = ccPrograms.filter(ccp => !excludedChannels.includes(ccp.db.channel));
  }
  console.info(`filtered programs after looking at excluded: ${ccPrograms.length}`);
  // sort by rating descending
  return ccPrograms.sort((a, b) => b.fields.rating - a.fields.rating);
}

const priority = {
  force: 'force', // force
  worseRated: 'worse rating', // turn off game with worse rating
  blowout: 'blowout', // blowout
  // blowoutMajor: 4, // major blowout
  gameOver: 'game over', // game over
};

// npm run invoke:controlCenterV2byLocation
module.exports.controlCenterV2byLocation = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: locationId } = getPathParameters(event);
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationId)
    .exec();
  console.info(`Running Control Center for: ${location.name} (${location.neighborhood})`);

  // get control center programs
  let ccPrograms: ControlCenterProgram[] = await getAirtablePrograms();
  console.info(`all programs: ${ccPrograms.length}`);
  console.info(`all boxes: ${location.boxes.length}`);
  if (!ccPrograms.length) {
    return respond(200, 'no programs');
  }

  // get programs from db from cc programs
  const { region } = location;
  // const { programmingId } = program.fields;
  const programmingIds = ccPrograms.map(p => p.fields.programmingId);
  console.log({ region, programmingIds });
  const programsResult = await new Invoke()
    .service('program')
    .name('get')
    .queryParams({ region, programmingIds })
    // .async()
    .go();
  const programs = programsResult && programsResult.data;
  console.log({ programs });

  // attach db program
  ccPrograms.map(ccp => {
    ccp.db = programs.find(p => p.programmingId === ccp.fields.programmingId);
  });

  // filter out currently showing programs, excluded programs, and sort by rating
  ccPrograms = filterPrograms(ccPrograms, location);

  console.log(JSON.stringify({ ccPrograms }));

  // get boxes that are CC active, and not manually locked
  let availableBoxes: Box[] = getAvailableBoxes(location.boxes);
  console.log('availableBoxes', availableBoxes.length);
  console.log(JSON.stringify({ availableBoxes }));

  for (const program of ccPrograms) {
    let selectedBox: ?Box = null;
    console.info(`trying to turn on: ${program.fields.title} (${program.db.channel}) {${program.fields.rating}}`);
    // const isCloseHighlyRated = [10, 9].includes(program.fields.rating) && program.isMinutesFromNow(10);
    // const isCloseNotHighlyRated = [7, 6, 5, 4, 3, 2, 1].includes(program.fields.rating) && program.isMinutesFromNow(5);
    // if (isCloseHighlyRated || isCloseNotHighlyRated) {
    if (program.isMinutesFromNow(0)) {
      selectedBox = findBoxGameOver(availableBoxes);
      // if (!selectedBox) selectedBox = findBoxBlowout(availableBoxes);
      if (!selectedBox) selectedBox = findBoxWithoutRating(availableBoxes, program);
      if (!selectedBox) selectedBox = findBoxWorseRating(availableBoxes, program);
    } else {
      console.info('game is too far in future');
      continue;
    }
    if (selectedBox) {
      await tune(location, selectedBox, program.db.channel, program.db);
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
    .filter('controlCenterV2')
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
  const boxes = location.boxes.filter(box => !!box.zone).sort((a, b) => a.zone.localeCompare(b.zone));

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
  const currentProgrammingIds = location.boxes.filter(b => !!b.program).map(b => b.program.programmingId);
  console.log({ upcomingPrograms });
  upcomingPrograms = upcomingPrograms.filter(p => !currentProgrammingIds.includes(p.fields.programmingId));
  const template = `\
    <section> \
    <h3>{{location.name}} ({{location.neighborhood}})</h4> \
    <h4>Now Showing:</h4> \
      <ul> \
      {{#boxes}} \
        <li> \
          <b>Box {{zone}}</b>: {{program.channelTitle}} <em>{{program.title}}</em> \
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

function buildAirtableNowShowing(location: Venue) {
  const transformed = [];
  location.boxes.forEach(box => {
    const { channel, channelSource: source, zone, program, label, appActive } = box;
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
  // remove manually changed boxes
  const manualChangeMinutesAgo = 60;
  const manualChangeBuffer = 15;

  return (
    boxes
      // only boxes with zones
      .filter(b => b.zone && b.zone.length)
      // remove manually changed within past 30 minutes
      .filter(
        b =>
          b.channelSource !== 'manual' ||
          (b.channelSource === 'manual' &&
            moment(b.channelChangeAt).diff(moment(), 'minutes') < -manualChangeMinutesAgo),
      )
      // remove manually changed not in current game window
      .filter(
        b =>
          b.channelSource !== 'manual' ||
          (b.channelSource === 'manual' &&
            moment(b.channelChangeAt).diff(moment(b.program.start), 'minutes') < -manualChangeBuffer),
      )
  );
}

async function tune(location: Venue, box: Box, channel: number, program: Program) {
  const command = 'tune';
  const reservation = {
    location,
    box,
    program: {
      ...program,
      channel,
    },
  };
  const source = 'control center';
  console.log(`-_-_-_-_-_-_-_-_-_ tune to ${channel}`, box.label);
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source })
    .async()
    .go();
}

function findBoxGameOver(boxes: Box[]): ?Box {
  console.info('findBoxGameOver');
  return boxes
    .filter(b => b.program)
    .filter(b => b.program.game)
    .find(b => b.program.game.summary.ended);
}

function findBoxBlowout(boxes: Box[]): ?Box {
  console.info('findBoxBlowout');
  return boxes
    .filter(b => b.program)
    .filter(b => b.program.game)
    .find(b => b.program.game.summary.blowout);
}

function findBoxWithoutRating(boxes: Box[], program: ControlCenterProgram): ?Box {
  console.info('findBoxWithoutRating');
  return boxes.filter(b => b.program).find(b => !b.program.clickerRating);
}

function findBoxWorseRating(boxes: Box[], program: ControlCenterProgram): ?Box {
  console.info('findBoxWorseRating');
  const sorted = boxes
    .filter(b => b.program)
    .filter(b => b.program.clickerRating)
    .filter(b => b.program.clickerRating < program.fields.rating)
    .sort((a, b) => a.program.clickerRating - b.program.clickerRating);
  return sorted && sorted.length ? sorted[0] : null;
}

async function getAirtablePrograms() {
  const airtableProgramsName = 'Control Center';
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const ccPrograms: ControlCenterProgram[] = await base(airtableProgramsName)
    .select({
      // view: 'Visible',
      filterByFormula: `AND( {rating} != BLANK(), {isOver} != 'Y', {startHoursFromNow} >= -4, {startHoursFromNow} <= 1 )`,
    })
    .all();
  return ccPrograms.map(p => new ControlCenterProgram(p));
}

async function updateLocationBox(
  locationId,
  boxIndex,
  channel: number,
  channelMinor?: number,
  source?: string,
  program: Program,
  channelChangeAt?: number,
) {
  const AWS = require('aws-sdk');
  const docClient = new AWS.DynamoDB.DocumentClient();
  const now = moment().unix() * 1000;
  let updateExpression = `set `;
  let expressionAttributeValues = {};
  if (channel) {
    updateExpression += `boxes[${boxIndex}].channel = :channel,`;
    expressionAttributeValues[':channel'] = parseInt(channel);
  }
  if (channelChangeAt) {
    updateExpression += `boxes[${boxIndex}].channelChangeAt = :channelChangeAt,`;
    expressionAttributeValues[':channelChangeAt'] = channelChangeAt;
  }
  if (source) {
    updateExpression += `boxes[${boxIndex}].channelSource = :channelSource,`;
    expressionAttributeValues[':channelSource'] = source;
  }
  if (program) {
    updateExpression += `boxes[${boxIndex}].program = :program,`;
    expressionAttributeValues[':program'] = program;
  }
  updateExpression += `boxes[${boxIndex}].updatedAt = :updatedAt`;
  expressionAttributeValues[':updatedAt'] = now;
  var params = {
    TableName: process.env.tableLocation,
    Key: { id: locationId },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  // console.log('calling...');
  // console.log({ params });
  // console.log('returned');
  try {
    await docClient.update(params).promise();
    // console.log({ x });
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
