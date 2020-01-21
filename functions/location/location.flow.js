// @flow
const { respond, getBody, getPathParameters, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const geolib = require('geolib');
const moment = require('moment');
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
    // update: true,
  },
);

module.exports.all = RavenLambdaWrapper.handler(Raven, async event => {
  let latitude, longitude;
  const pathParams = getPathParameters(event);
  const { partner } = event.headers;
  const milesRadius =
    event.queryStringParameters && event.queryStringParameters.miles ? event.queryStringParameters.miles : null;

  if (pathParams) {
    latitude = pathParams.latitude;
    longitude = pathParams.longitude;
    console.log('lat/lng', latitude, longitude);
  }
  let allLocations: Venue[] = await dbLocation.scan().exec();

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
      const miles = geolib.convertUnit('mi', meters);
      const roundedMiles = Math.round(10 * miles) / 10;
      locations[i].distance = roundedMiles;
    }
  });
  if (milesRadius) {
    allLocations = allLocations.filter(l => l.distance <= milesRadius);
  }
  const sorted = allLocations.sort((a, b) => (a.distance < b.distance ? -1 : 1));

  return respond(200, sorted);
});

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);

  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();

  // loop through boxes, and update reserved status if necessary
  if (location.boxes) {
    location.boxes.forEach((o, i, boxes) => {
      // check if box is reserved and end time is in past
      if (boxes[i].reserved && moment(boxes[i].end).diff(moment().toDate()) < 0) {
        // if so, update to not reserved
        // delete boxes[i].end;
        // delete boxes[i].reserved;
        // boxes[i].end
        boxes[i].reserved = false;
        // boxes[i] = { ...boxes[i] };
      }
    });
    await location.save();

    location.boxes = location.boxes.filter(b => b.appActive);

    // filter out inactive boxes
    // sort boxes alphabetically
    location.boxes = location.boxes.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  }

  // delete location.losantId;

  // set distance
  console.log(event);
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

    const updatedLocation: Venue = await dbLocation.update({ id }, body, { returnValues: 'ALL_NEW' });
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

    await new Invoke()
      .service('location')
      .name('updateBoxInfo')
      .body({ channel: major, channelMinor: minor, source: 'manual' })
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

        await new Invoke()
          .service('admin')
          .name('logChannelChange')
          .body({
            location: `${location.name} (${location.neighborhood})`,
            zone: box.zone,
            from: originalChannel,
            to: major,
            time: new Date(),
            type: name,
            boxId,
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

module.exports.allOff = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);

  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();
  const { boxes } = location;
  for (const box of boxes) {
    const command = 'key';
    const key = 'poweroff';
    const reservation = {
      location,
      box,
      program: {
        // channel: box.setupChannel,
      },
    };
    console.log('turning off box', box);
    await new Invoke()
      .service('remote')
      .name('command')
      .body({ reservation, command, key })
      .async()
      .go();
    console.log('turned off box', box);
  }
  return respond(200, 'ok');
});

module.exports.allOn = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);

  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(id)
    .exec();
  const { boxes } = location;
  for (const box of boxes) {
    const command = 'key';
    const key = 'poweron';
    const reservation = {
      location,
      box,
      program: {
        // channel: box.setupChannel,
      },
    };
    console.log('turning on box', box);
    await new Invoke()
      .service('remote')
      .name('command')
      .body({ reservation, command, key })
      .headers(event.headers)
      .async()
      .go();
    console.log('turned on', box);
  }
  return respond(200, 'ok');
});

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
  const { channel, channelMinor, source } = getBody(event);

  console.time('get location');
  const location: Venue = await dbLocation
    .queryOne('id')
    .eq(locationId)
    .exec();
  console.timeEnd('get location');

  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  console.log({ boxId, boxIndex });

  console.time('get program 2');
  const programResult = await new Invoke()
    .service('program')
    .name('get')
    .queryParams({ channel: channel, region: location.region })
    .go();
  const program = programResult && programResult.data;
  console.log({ program });
  console.timeEnd('get program 2');

  console.time('update location box');
  console.log({ locationId, boxIndex, channel, channelMinor, source, program });
  await updateLocationBox(locationId, boxIndex, channel, channelMinor, source, program);
  console.timeEnd('update location box');

  return respond(200);
});

class ControlCenterProgram {
  fields: {
    start: Date,
    rating: number,
    programmingId: string,
    channel: number,
    title: string,
  };
  constructor(obj: any) {
    Object.assign(this, obj);
  }
  isMinutesFromNow(minutes: number) {
    return moment.duration(moment(this.fields.start).diff(moment(), 'minutes')) <= minutes;
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
  const liveChannelIds = boxes.map(b => b.channel);
  ccPrograms = ccPrograms.filter(ccp => !liveChannelIds.includes(ccp.fields.channel));
  console.info(`filtered programs after looking at currently showing: ${ccPrograms.length}`);

  // remove channels that location doesnt have
  const excludedChannels =
    location.channels && location.channels.exclude && location.channels.exclude.map(channel => parseInt(channel, 10));
  console.info({ excludedChannels });

  if (excludedChannels && excludedChannels.length) {
    ccPrograms = ccPrograms.filter(ccp => !excludedChannels.includes(ccp.fields.channel));
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

  // get control center programs
  let ccPrograms: ControlCenterProgram[] = await getAirtablePrograms();
  console.info(`all programs: ${ccPrograms.length}`);
  console.info(`all boxes: ${location.boxes.length}`);

  // filter out currently showing programs, excluded programs, and sort by rating
  ccPrograms = filterPrograms(ccPrograms, location);

  // get boxes that are CC active, and not manually locked
  let availableBoxes: Box[] = getAvailableBoxes(location.boxes);

  for (const program of ccPrograms) {
    let selectedBox: ?Box = null;
    console.info(`trying to turn on: ${program.fields.title} (${program.fields.channel})`);
    switch (program.fields.rating) {
      case 10:
      case 9:
        if (program.isMinutesFromNow(10)) {
          selectedBox = findBoxGameOver(availableBoxes);
          if (!selectedBox) selectedBox = findBoxBlowout(availableBoxes);
          if (!selectedBox) selectedBox = findProgramlessBox(availableBoxes);
          if (!selectedBox) selectedBox = findUnratedBox(availableBoxes);
          if (!selectedBox) selectedBox = findBoxWorseRating(availableBoxes, program);
          if (!selectedBox) selectedBox = findWorstRatedBox(availableBoxes);
          if (!selectedBox) selectedBox = justFindBox(availableBoxes);
        }
        break;
      case 8:
      case 7:
      case 6:
      case 5:
      case 4:
      case 3:
      case 2:
      case 1:
        if (program.isMinutesFromNow(5)) {
          selectedBox = findBoxGameOver(availableBoxes);
          if (!selectedBox) selectedBox = findBoxBlowout(availableBoxes);
          if (!selectedBox) selectedBox = findBoxWorseRating(availableBoxes, program);
          if (!selectedBox) selectedBox = findEmptyBox(availableBoxes);
        }
        break;
      default:
        break;
    }
    if (selectedBox) {
      await tune(location, selectedBox, program.fields.channel);
      // remove box so it doesnt get reassigned
      console.log(`boxes: ${availableBoxes.length}`);
      console.log({ availableBoxes, selectedBox });
      availableBoxes = availableBoxes.filter(b => selectedBox && b.id !== selectedBox.id);
      console.log(`boxes remaining: ${availableBoxes.length}`);
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
  let locations: Venue[] = await dbLocation.scan().exec();
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

function buildAirtableNowShowing(location: Venue) {
  const transformed = [];
  location.boxes.forEach(box => {
    const { channel, channelSource: source, zone, program, label, appActive } = box;
    let game, programTitle;
    if (program) {
      game = program.game;
      console.log(game);
      programTitle = program.title;
      if (program.description) {
        programTitle += `: ${program.description.substring(0, 20)}`;
      }
    }
    transformed.push({
      fields: {
        location: `${location.name}: ${location.neighborhood}`,
        program: programTitle ? programTitle : '',
        game: game ? JSON.stringify(game) : '',
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
  const manualChangeMinutesAgo = 30;
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

async function tune(location: Venue, box: Box, channel: number) {
  const command = 'tune';
  const reservation = {
    location,
    box,
    program: {
      channel,
    },
  };
  const source = 'control center';
  // console.log(`tune to ${channel}`, box.label);
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source })
    .async()
    .go();
}

function findBoxGameOver(boxes: Box[]): ?Box {
  return boxes
    .filter(b => b.program)
    .filter(b => b.program.game)
    .find(b => b.program.game.summary.ended);
}
function findBoxBlowout(boxes: Box[]): ?Box {
  return boxes
    .filter(b => b.program)
    .filter(b => b.program.game)
    .find(b => b.program.game.summary.blowout);
}
function findBoxWorseRating(boxes: Box[], program: ControlCenterProgram): ?Box {
  const sorted = boxes
    .filter(b => b.program)
    .filter(b => b.program.clickerRating < program.fields.rating)
    .sort((a, b) => a.program.clickerRating - b.program.clickerRating);
  return sorted && sorted.length ? sorted[0] : null;
}
function findWorstRatedBox(boxes: Box[]): ?Box {
  const sorted = boxes
    .filter(b => b.program)
    .filter(b => b.program.clickerRating)
    .sort((a, b) => a.program.clickerRating - b.program.clickerRating);
  return sorted && sorted.length ? sorted[0] : null;
}
function justFindBox(boxes: Box[]): Box {
  return boxes.sort((a, b) => a.channelChangeAt - b.channelChangeAt)[0];
}
function findEmptyBox(boxes: Box[]): ?Box {
  return boxes.filter(b => b.program).find(b => !b.program.clickerRating);
}
function findUnratedBox(boxes: Box[]): ?Box {
  return findProgramlessBox(boxes) || findUnratedBox(boxes);
}
function findProgramlessBox(boxes: Box[]): ?Box {
  return boxes.find(b => !b.program);
}
// function findBoxForce(boxes: Box[], program: ControlCenterProgram): ?Box {
//   return (
//     findBoxGameOver(boxes) ||
//     findBoxBlowout(boxes) ||
//     findProgramlessBox(boxes) ||
//     findUnratedBox(boxes) ||
//     findBoxWorseRating(boxes, program) ||
//     findWorstRatedBox(boxes) ||
//     justFindBox(boxes)
//   );
// }

// function selectBox(program: ControlCenterProgram, type: string, boxes: Box[]): ?Box {
//   boxes = boxes.sort((a, b) => a.label.localeCompare(b.label));
//   switch (type) {
//     case priority.force:
//       return findBoxForce(boxes, program);
//     case priority.gameOver:
//       return findBoxGameOver(boxes);
//     case priority.blowout:
//       return findBoxBlowout(boxes);
//     case priority.worseRated:
//       return findBoxWorseRating(boxes, program);
//     default:
//       return null;
//   }
// }

// async function evaluateProgram(program: ControlCenterProgram, boxes: Box[]) {
//   switch (program.fields.rating) {
//     case 10:
//       if (program.isMinutesFromNow(10)) {
//         await changeChannel(program, priority.force);
//       }
//     case 9:
//     case 8:
//     case 7:
//     case 6:
//     case 5:
//     case 4:
//     case 3:
//     case 2:
//     case 1:
//     default:
//       break;
//   }
// }

// async function changeChannel(program: ControlCenterProgram, boxes: Box[], changeType: string) {}

async function getAirtablePrograms() {
  const airtableProgramsName = 'Control Center';
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const ccPrograms: ControlCenterProgram[] = await base(airtableProgramsName)
    .select({
      view: 'All',
      filterByFormula: `AND( {rating} != BLANK(), {startHoursFromNow} >= -2, {startHoursFromNow} <= 1 )`,
    })
    .all();
  // get games, to see if they

  return ccPrograms.map(p => new ControlCenterProgram(p));
}

async function updateLocationBox(
  locationId,
  boxIndex,
  channel: number,
  channelMinor?: number,
  source?: string,
  program: Program,
) {
  const AWS = require('aws-sdk');
  const docClient = new AWS.DynamoDB.DocumentClient();
  const now = moment().unix() * 1000;
  let updateExpression = `set `;
  let expressionAttributeValues = {};
  if (channel) {
    updateExpression += `boxes[${boxIndex}].channel = :channel,`;
    expressionAttributeValues[':channel'] = parseInt(channel);
    updateExpression += `boxes[${boxIndex}].channelChangeAt = :channelChangeAt,`;
    expressionAttributeValues[':channelChangeAt'] = now;
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
