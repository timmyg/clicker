const { respond } = require('serverless-helpers');

// TODO
module.exports.all = async event => {
  // get zip from body
  // find locations, based on zip (if not null)
};

// TODO
module.exports.add = async event => {
  // validate name, zip, neighborhood, lat, lng
  // generate id based on name/neighborhood
  // upset
};

// TODO
module.exports.update = async event => {
  // get id from params
  // const featureName = decodeURI(event.pathParameters.id); // move to shared?
  // upsert
};

module.exports.health = async => {
  return respond(200, `hello`);
};
