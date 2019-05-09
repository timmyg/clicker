const { respond, getBody, getPathParameters } = require('serverless-helpers');
const dynamoose = require('dynamoose');
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
        label: String, // physical label id on tv
        tunerBond: Boolean, // not sure what this is
        setupChannel: Number,
        ip: String,
        reserved: Boolean,
        end: Date,
      },
    ],
    name: { type: String, required: true },
    neighborhood: { type: String, required: true },
    zip: { type: Number, required: true },
    // lat: { type: Number, required: true },
    // lng: { type: Number, required: true },
    // ip: String,
    img: String,
    distance: Number,
    active: Boolean,
    setup: Boolean,
  },
  {
    timestamps: true,
  },
);

module.exports.all = async event => {
  const allLocations = await Location.scan().exec();
  allLocations.forEach(l => {
    delete l.boxes;
  });
  const sorted = allLocations.sort((a, b) => (a.distance < b.distance ? -1 : 1));
  return respond(200, sorted);
};

module.exports.get = async event => {
  const { id } = getPathParameters(event);

  const location = await Location.queryOne('id')
    .eq(id)
    .exec();

  // sort boxes alphabetically
  location.boxes = location.boxes.sort((a, b) => {
    const labelA = a.label || a.locationName;
    const labelB = b.label || b.locationName;
    return labelA.localeCompare(labelB);
  });

  // TODO set reserved
  // call reservations to get active ones by location

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
      console.log('add box', id, box);
      location.boxes.push(box);
      // updatedLocation = await Location.update({ id }, { $ADD: { boxes: box } }, { returnValues: 'ALL_NEW' });
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

  var boxIndex = location.boxes.findIndex(b => b.id === boxId);
  location.boxes[boxIndex]['reserved'] = true;
  location.boxes[boxIndex]['end'] = end;
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
  for (const b of boxes) {
    b.setupChannel = setupChannel;
    setupChannel++;
    // TODO actually change channel with REMOTE
  }
  await Location.update({ id }, { boxes });
  return respond(200, `hello`);
};

module.exports.health = async event => {
  return respond(200, 'ok');
};
