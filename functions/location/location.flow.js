// @flow
const { respond, getBody, getPathParameters, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const geolib = require('geolib');
const moment = require('moment');
const uuid = require('uuid/v1');
let Location;

declare class process {
  static env: {
    stage: string,
    tableLocation: string,
  };
}
function init() {
  Location = dynamoose.model(
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
        index: true,
        global: true,
      },
      boxes: [
        {
          id: String,
          clientAddress: String, // dtv calls this clientAddr
          locationName: String, // dtv name
          label: String, // physical label id on tv (defaults to locationName)
          tunerBond: Boolean, // not sure what this is
          setupChannel: Number,
          ip: String,
          reserved: Boolean,
          end: Date,
          zone: String,
          notes: String,
          appActive: Boolean,
          channel: Number,
          channelChangeAt: Date,
          channelSource: {
            type: String,
            enum: ['app', 'control center', 'manual', 'control center daily'],
          },
        },
      ],
      channels: {
        exclude: [String],
      },
      packages: [String],
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
      announcement: String,
      notes: String,
      // calculated fields
      distance: Number,
      openTvs: Boolean,
    },
    {
      timestamps: true,
      // update: true,
    },
  );
}

module.exports.all = RavenLambdaWrapper.handler(Raven, async event => {
  init();
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
  let allLocations = await Location.scan().exec();

  // set whether open tv's
  allLocations.forEach((l, i, locations) => {
    console.log(l);
    console.log(l.boxes);
    if (l.boxes) {
      l.openTvs = l.boxes.every(b => !b.reserved || moment(b.end).diff(moment().toDate()) < 0);
    }
  });

  allLocations.forEach((l, i, locations) => {
    delete l.boxes;
    delete l.losantId;
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
  init();
  const { id } = getPathParameters(event);

  const location = await Location.queryOne('id')
    .eq(id)
    .exec();

  // loop through boxes, and update reserved status if necessary
  if (location.boxes) {
    location.boxes.forEach((o, i, boxes) => {
      // check if box is reserved and end time is in past
      if (boxes[i].reserved && moment(boxes[i].end).diff(moment().toDate()) < 0) {
        // if so, update to not reserved
        delete boxes[i].reserved;
        delete boxes[i].end;
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
  init();
  try {
    const body = getBody(event);
    console.log(body);
    const location = await Location.create(body);
    return respond(201, location);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
});

module.exports.update = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  try {
    const { id } = getPathParameters(event);
    const body = getBody(event);

    const updatedLocation = await Location.update({ id }, body, { returnValues: 'ALL_NEW' });
    return respond(200, updatedLocation);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
});

module.exports.setBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { boxes, ip } = getBody(event);
  console.log({ boxes, ip });
  const { id } = getPathParameters(event);

  const location = await Location.queryOne('id')
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
      await Location.update({ id }, { $ADD: { boxes: [box] } });
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
  // await Location.update({ id }, { boxes: location.boxes }, { returnValues: 'ALL_NEW' });

  return respond(201, updatedLocation);
});

module.exports.setBoxReserved = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { id: locationId, boxId } = getPathParameters(event);
  const { end } = getBody(event);

  const location = await Location.queryOne('id')
    .eq(locationId)
    .exec();

  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  location.boxes[boxIndex]['reserved'] = true;
  location.boxes[boxIndex]['end'] = end;
  await location.save();

  return respond(200);
});

module.exports.setBoxFree = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { id: locationId, boxId } = getPathParameters(event);

  const location = await Location.queryOne('id')
    .eq(locationId)
    .exec();

  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  delete location.boxes[boxIndex]['reserved'];
  delete location.boxes[boxIndex]['end'];
  await location.save();

  return respond(200);
});

module.exports.saveBoxesInfo = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { id: locationId } = getPathParameters(event);
  const { boxes } = getBody(event);
  console.log(boxes);
  const location = await Location.queryOne('id')
    .eq(locationId)
    .exec();

  for (const box of boxes) {
    const { boxId, info } = box;
    console.log(boxId, info);

    const { major } = info;

    const i = location.boxes.findIndex(b => b.id === boxId);
    console.log('box', location.boxes[i], major);
    const originalChannel = location.boxes[i]['channel'];
    console.log('original channel', originalChannel);
    console.log('current channel', major);
    if (originalChannel !== major) {
      await new Invoke()
        .service('location')
        .name('updateBoxChannel')
        .body({ channel: major, source: 'manual' })
        .pathParams({ id: location.id, boxId })
        .async()
        .go();

      console.time('track event');
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
      console.timeEnd('track event');

      const text = `Manual Zap @ ${location.name} (${location.neighborhood}) from *${originalChannel}* to *${major}* (Zone ${location.boxes[i].zone})`;
      await new Invoke()
        .service('notification')
        .name('sendControlCenter')
        .body({ text })
        .async()
        .go();
      await new Invoke()
        .service('notification')
        .name('sendTasks')
        .body({ text, importance: 1 })
        .async()
        .go();

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

  return respond(200);
});

module.exports.setLabels = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { id } = getPathParameters(event);
  const boxesWithLabels = getBody(event);
  const location = await Location.queryOne('id')
    .eq(id)
    .exec();
  const { boxes } = location;
  console.log(boxes, boxesWithLabels);
  const updatedBoxes = boxes.map(x => Object.assign(x, boxesWithLabels.find(y => y.setupChannel == x.setupChannel)));
  console.log(updatedBoxes);
  await Location.update({ id }, { boxes: updatedBoxes }, { returnValues: 'ALL_NEW' });

  return respond(200, boxes);
});

module.exports.identifyBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { id } = getPathParameters(event);

  const location = await Location.queryOne('id')
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
  await Location.update({ id }, { boxes });
  return respond(200, `hello`);
});

module.exports.connected = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { losantId } = getPathParameters(event);
  const location = await Location.queryOne('losantId')
    .eq(losantId)
    .all()
    .exec();
  location.connected = true;
  await location.save();

  const text = `Antenna Connected @ ${location.name} (${location.neighborhood})`;
  await new Invoke()
    .service('notification')
    .name('sendAntenna')
    .body({ text })
    .async()
    .go();

  return respond(200, 'ok');
});

module.exports.disconnected = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { losantId } = getPathParameters(event);
  const location = await Location.queryOne('losantId')
    .eq(losantId)
    .all()
    .exec();
  location.connected = false;
  await location.save();

  const text = `Antenna Disconnected @ ${location.name} (${location.neighborhood})`;
  await new Invoke()
    .service('notification')
    .name('sendAntenna')
    .body({ text })
    .async()
    .go();
  return respond(200, 'ok');
});

module.exports.allOff = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { id } = getPathParameters(event);

  const location = await Location.queryOne('id')
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
  init();
  const { id } = getPathParameters(event);

  const location = await Location.queryOne('id')
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
  init();
  // const { id } = getPathParameters(event);
  let allLocations = await Location.scan().exec();

  for (const location of allLocations) {
    const { losantId } = location;
    const body = {
      losantId,
      boxes: [],
    };
    for (const box of location.boxes) {
      if (!!box.zone) {
        // ensure box has a zone to only track control center boxes
        const { id: boxId, ip, clientAddress: client } = box;
        body.boxes.push({ boxId, ip, client });
      }
    }
    if (losantId.length > 3 && !!body.boxes.length) {
      console.log({ body });
      await new Invoke()
        .service('remote')
        .name('checkBoxesInfo')
        .body(body)
        .async()
        .go();
    }
  }
  return respond(200, 'ok');
});

module.exports.controlCenterLocationsByRegion = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { regions } = getPathParameters(event);
  console.log(regions);
  if (!regions || !regions.length) {
    return respond(200, []);
  }
  const locations = await Location.scan()
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

module.exports.updateBoxChannel = RavenLambdaWrapper.handler(Raven, async event => {
  init();
  const { id: locationId, boxId } = getPathParameters(event);
  const { channel, source } = getBody(event);

  const location = await Location.queryOne('id')
    .eq(locationId)
    .exec();
  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  await updateLocationBoxChannel(locationId, boxIndex, channel, source);
  return respond(200);
});

async function updateLocationBoxChannel(locationId, boxIndex, channel: number, source) {
  const AWS = require('aws-sdk');
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: process.env.tableLocation,
    Key: { id: locationId },
    ReturnValues: 'ALL_NEW',
    UpdateExpression:
      'set boxes[' +
      boxIndex +
      '].channel = :channel, boxes[' +
      boxIndex +
      '].channelSource = :channelSource, boxes[' +
      boxIndex +
      '].channelChangeAt = :channelChangeAt',
    ExpressionAttributeValues: {
      ':channel': channel,
      ':channelSource': source,
      ':channelChangeAt': moment().unix() * 1000,
    },
  };
  console.log({ params });
  try {
    const x = await docClient.update(params).promise();
    console.log({ x });
  } catch (err) {
    console.log({ err });
    return err;
  }
}
