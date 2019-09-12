const { respond, getBody, getPathParameters, invokeFunctionSync } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const geolib = require('geolib');
const moment = require('moment');
const uuid = require('uuid/v1');
const { IncomingWebhook } = require('@slack/webhook');
require('dotenv').config({ path: '../.env.example' });

const Location = dynamoose.model(
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
        active: Boolean,
        channel: Number,
        channelSource: {
          type: String,
          enum: ['app', 'control center', 'manual'],
        },
      },
    ],
    channels: {
      exclude: [String],
    },
    packages: [String],
    name: { type: String, required: true },
    neighborhood: { type: String, required: true },
    zip: { type: Number, required: true },
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
  },
  {
    timestamps: true,
  },
);

module.exports.all = async event => {
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
};

module.exports.get = async event => {
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

    location.boxes = location.boxes.filter(b => b.active);

    // filter out inactive boxes
    // sort boxes alphabetically
    location.boxes = location.boxes.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  }

  return respond(200, location);
};

module.exports.create = async event => {
  try {
    const body = getBody(event);
    const location = await Location.create(body);
    return respond(201, location);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.update = async event => {
  try {
    const { id } = getPathParameters(event);
    const body = getBody(event);

    const updatedLocation = await Location.update({ id }, body, { returnValues: 'ALL_NEW' });
    return respond(200, updatedLocation);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.setBoxes = async event => {
  const { boxes, ip } = getBody(event);
  const { id } = getPathParameters(event);

  const location = await Location.queryOne('id')
    .eq(id)
    .exec();

  if (location.setup) {
    return respond(204, 'location has already been setup');
  }

  let updatedLocation;
  location.boxes = location.boxes || [];
  boxes.forEach(box => {
    box.clientAddress = box.clientAddr;
    box.ip = ip;
    const existingBox =
      location.boxes &&
      location.boxes.find(locationBox => locationBox.ip === box.ip && locationBox.clientAddress === box.clientAddress);
    if (!existingBox) {
      box.id = uuid();
      box.active = true;
      // set label to locationName or random 2 alphanumeric characters
      box.label =
        box.locationName ||
        Math.random()
          .toString(36)
          .substr(2, 2);
      console.log('add box with label', id, box);
      location.boxes.push(box);
    }
  });
  await Location.update({ id }, { boxes: location.boxes }, { returnValues: 'ALL_NEW' });

  return respond(201, updatedLocation);
};

module.exports.setBoxReserved = async event => {
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
};

module.exports.setBoxFree = async event => {
  const { id: locationId, boxId } = getPathParameters(event);

  const location = await Location.queryOne('id')
    .eq(locationId)
    .exec();

  const boxIndex = location.boxes.findIndex(b => b.id === boxId);
  delete location.boxes[boxIndex]['reserved'];
  delete location.boxes[boxIndex]['end'];
  await location.save();

  return respond(200);
};

module.exports.saveBoxInfo = async event => {
  const { id: locationId, boxId } = getPathParameters(event);
  const { major } = getBody(event);

  const location = await Location.queryOne('id')
    .eq(locationId)
    .exec();

  const i = location.boxes.findIndex(b => b.id === boxId);
  console.log('box', location.boxes[i], major);
  if (location.boxes[i]['channel'] !== major) {
    location.boxes[i]['channel'] = major;
    location.boxes[i]['channelSource'] = 'manual';
    await location.save();
  }

  return respond(200);
};

module.exports.setLabels = async event => {
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
};

module.exports.identifyBoxes = async event => {
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
    await invokeFunctionSync(`remote-${process.env.stage}-command`, { reservation, command });
  }
  await Location.update({ id }, { boxes });
  return respond(200, `hello`);
};

module.exports.connected = async event => {
  const { losantId } = getPathParameters(event);
  const locations = await Location.scan('losantId')
    .eq(losantId)
    .all()
    .exec();
  const location = locations[0];
  location.connected = true;
  await location.save();

  const antennaWebhook = new IncomingWebhook(process.env.slackAntennaWebhookUrl);
  const text = `Antenna connected at ${location.name} (${location.neighborhood})}(${process.env.stage})`;
  const icon_emoji = ':tada:';
  await antennaWebhook.send({
    text,
    icon_emoji,
  });

  return respond(200, 'ok');
};

module.exports.disconnected = async event => {
  const { losantId } = getPathParameters(event);
  const locations = await Location.scan('losantId')
    .eq(losantId)
    .all()
    .exec();
  const location = locations[0];
  location.connected = false;
  await location.save();

  const antennaWebhook = new IncomingWebhook(process.env.slackAntennaWebhookUrl);
  const text = `Antenna disconnected at ${location.name} (${location.neighborhood})} (${process.env.stage})`;
  const icon_emoji = ':exclamation:';
  await antennaWebhook.send({
    text,
    icon_emoji,
  });

  return respond(200, 'ok');
};

module.exports.allOff = async event => {
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
    await invokeFunctionSync(`remote-${process.env.stage}-command`, { reservation, command, key });
    console.log('turned off box', box);
  }
  return respond(200, 'ok');
};

module.exports.allOn = async event => {
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
    await invokeFunctionSync(`remote-${process.env.stage}-command`, { reservation, command, key });
    console.log('turned on', box);
  }
  return respond(200, 'ok');
};

module.exports.checkAllBoxesInfo = async event => {
  // const { id } = getPathParameters(event);
  let allLocations = await Location.scan().exec();

  allLocations.forEach(location => {
    for (const box of location.boxes) {
      const { losantId } = location;
      const { id: boxId, ip, clientAddress: client } = box;
      const response = await invokeFunctionSync(`remote-${process.env.stage}-checkBoxInfo`, {
        losantId,
        boxId,
        ip,
        client,
      });
      console.log(response);
    }
  });
  return respond(200, 'ok');
};

module.exports.controlCenterLocationsByRegion = async event => {
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
};

module.exports.health = async event => {
  return respond(200, 'ok');
};
