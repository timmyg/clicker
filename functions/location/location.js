const { respond, getBody, getPathParameters } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const uuid = require('uuid/v1');
require('dotenv').config({ path: '../.env' });

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
        clientAddress: String, // dtv calls this clientAddr
        locationName: String, // dtv name
        label: String, // physical label id on tv
        setupChannel: Number,
      },
    ],
    name: { type: String, required: true },
    neighborhood: { type: String, required: true },
    zip: { type: Number, required: true },
    // lat: { type: Number, required: true },
    // lng: { type: Number, required: true },
    ip: String,
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
  return respond(200, allLocations);
};

module.exports.get = async event => {
  const params = getPathParameters(event);
  const { id } = params;

  const location = await Location.queryOne('id')
    .eq(id)
    .exec();

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
    const params = getPathParameters(event);
    const body = getBody(event);
    const { id } = params;

    const updatedLocation = await Location.update({ id }, body, { returnValues: 'ALL_NEW' });
    return respond(200, updatedLocation);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.getBoxes = async event => {
  // TODO need to get availability from reservations
  const params = getPathParameters(event);
  const { id: locationId } = params;
  const location = await Location.queryOne('id')
    .eq(locationId)
    .exec();
  return respond(200, location.boxes);
};

module.exports.addBoxes = async event => {
  const boxes = getBody(event);
  const params = getPathParameters(event);
  const { id } = params;

  // TODO do we need to add main receiver as a box?
  const updatedBoxes = await Location.update({ id }, { boxes }, { returnValues: 'ALL_NEW' });
  return respond(200, updatedBoxes);
};

module.exports.setLabels = async event => {
  const params = getPathParameters(event);
  const boxesWithLabels = getBody(event);
  const { id } = params;
  const location = await Location.queryOne('id')
    .eq(id)
    .exec();
  const { boxes } = location;
  console.log(boxes, boxesWithLabels);
  const updatedBoxes = boxes.map(x => Object.assign(x, boxesWithLabels.find(y => y.setupChannel == x.setupChannel)));
  console.log(updatedBoxes);
  await Location.update({ id }, { boxes: updatedBoxes });

  return respond(200, boxes);
};

module.exports.identifyBoxes = async event => {
  const params = getPathParameters(event);
  const { id } = params;

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
