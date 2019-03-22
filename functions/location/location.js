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
    boxes: {
      clientAddress: String, // dtv calls this clientAddr
      locationName: String, // dtv name
      label: String, // physical label id on tv
      setupChannel: Number,
    },
    name: { type: String, required: true },
    neighborhood: { type: String, required: true },
    zip: { type: Number, required: true },
    // lat: { type: Number, required: true },
    // lng: { type: Number, required: true },
    ip: String,
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

module.exports.all = async event => {
  const allLocations = await Location.scan().exec();
  return respond(200, allLocations);
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

    // console.log({ id: id, ...body });
    // const updatedLocation = await Location.update({ losantId: id, ...body });
    await Location.update({ id: id }, body, { returnValues: 'ALL_NEW' });
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

module.exports.setBoxes = async event => {
  // TODO ensure dont accidentally overwrite labels
  const body = getBody(event);
  const params = getPathParameters(event);

  // TODO do we need to add main receiver as a box?

  const { id } = params;
  await Location.update({ id }, { boxes: body });
  return respond(200);
};

module.exports.setLabels = async event => {
  const params = getPathParameters(event);
  const boxesWithLabels = getBody(event);
  const { id } = params;
  const location = await Location.queryOne('id')
    .eq(id)
    .exec();
  const { boxes } = location;
  const updatedBoxes = boxes.map(x => Object.assign(x, boxesWithLabels.find(y => y.setupChannel == x.setupChannel)));
  await Location.update({ id }, { boxes: updatedBoxes });

  return respond(200, boxes);
};

module.exports.identify = async event => {
  const params = getPathParameters(event);
  const boxesWithLabels = getBody(event);
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

module.exports.health = async => {
  return respond();
};
