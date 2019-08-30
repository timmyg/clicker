const { respond, getBody, getPathParameters, invokeFunctionSync } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const geolib = require('geolib');
const moment = require('moment');
const Airtable = require('airtable');
const uuid = require('uuid/v1');
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
        zone: Number,
        active: Boolean,
      },
    ],
    channels: {
      local: [String],
      premium: [String],
      exclude: [String],
    },
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

module.exports.getLocalChannels = async event => {
  const allLocations = await Location.scan().exec();
  let locationsByZip = {};
  allLocations.forEach(l => {
    locationsByZip[l.zip] = locationsByZip[l.zip] || [];
    if (l.channels && l.channels.local) {
      locationsByZip[l.zip] = locationsByZip[l.zip].concat(l.channels.local);
    }
    // remove duplicates
    locationsByZip[l.zip] = locationsByZip[l.zip].filter((elem, index, self) => {
      return index === self.indexOf(elem);
    });
  });
  return respond(200, locationsByZip);
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

module.exports.controlCenterLocationsByRegions = async event => {
  // const { regions } = getPathParameters(event);
  const { regions } = event.queryStringParameters;
  console.log(regions);
  if (!regions) {
    return respond(200, []);
  }
  console.log(regions);
  console.log(event);
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
  return respond(200, locations);
};

module.exports.controlCenter = async event => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  console.log('searching for games to change');
  let games = await base('Games')
    .select({
      view: 'Scheduled',
    })
    .all();
  console.log(`found ${games.length} games`);
  games = games.filter(g => new Date(g.get('Game Start')) <= new Date());
  console.log(`found ${games.length} games now/past`);
  console.log(games);
  let changedCount = 0;
  if (games.length) {
    // loop through games
    for (const game of games) {
      const regions = game.get('Region');
      const channel = game.get('Channel');
      const zone = +game.get('TV Zone');
      const gameId = game.id;
      console.log(`searching for locations for:`, { regions, channel, zone });
      // find locations that are in region and control center enabled
      const result = await invokeFunctionSync(
        `location-${process.env.stage}-controlCenterLocationsByRegions`,
        null,
        { regions },
        event.headers,
      );

      const locations = result;

      console.log(`found ${locations.length} locations`);
      // loop through locations
      for (const location of locations) {
        // find boxes that have game zone
        const boxes = location.boxes.filter(
          b => b.zone === zone && (!b.reserved || (b.reserved && moment(b.end).diff(moment().toDate()) < 0)),
        );
        console.log(`found ${boxes.length} boxes`);
        // loop through boxes, change to game channel
        for (const box of boxes) {
          const command = 'tune';
          const reservation = {
            location,
            box,
            program: {
              channel: channel.split('-')[0],
              channelMinor: channel.split('-')[1],
            },
          };
          console.log('⚡ ⚡ tuning...');
          console.log('location:', location.name, location.neighborhood);
          console.log('box', box.label, box.ip);
          console.log('channel', channel);
          await invokeFunctionSync(`remote-${process.env.stage}-command`, { reservation, command });
          changedCount++;
        }
      }
      // mark game as completed on airtable
      // TODO maybe delete in future?
      await base('Games').update(gameId, {
        Completed: true,
      });
    }
  }

  return respond(200, { changedCount });
};

module.exports.health = async event => {
  return respond(200, 'ok');
};
