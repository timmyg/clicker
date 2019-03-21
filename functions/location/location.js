const { respond, getBody, getPathParameters } = require('serverless-helpers');
const dynamoose = require('dynamoose');
const uuid = require('uuid/v1');
require('dotenv').config({ path: '../.env' });

const Location = dynamoose.model(
  process.env.tableLocation,
  {
    id: {
      type: String,
      hashKey: true,
      default: uuid,
    },
    receiverId: String,
    name: String,
    neighborhood: String,
    zip: Number,
    lat: Number,
    lng: Number,
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

module.exports.add = async event => {
  // validate name, zip, neighborhood, lat, lng
  const body = getBody(event);
  const { name, neighborhood, zip, lat, lng } = body;
  const locations = await Location.scan({ name, neighborhood }).exec();
  if (locations && locations.length) {
    return respond(200, locations[0]);
  } else {
    const location = await Location.create({ name, neighborhood, zip, lat, lng });
    return respond(201, location);
  }
};

module.exports.update = async event => {
  const params = getPathParameters(event);
  const body = getBody(event);
  const { id } = params;
  const { receiverId, name, neighborhood } = body;

  // add non null values to be updated
  let updateData = Object.assign({}, receiverId && { receiverId }, name && { name }, neighborhood && { neighborhood });

  try {
    const updatedLocation = await Location.update({ id }, updateData, { returnValues: 'ALL_NEW' });
    return respond(200, updatedLocation);
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.health = async => {
  return respond();
};
