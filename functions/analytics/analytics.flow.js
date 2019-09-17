// @flow
require('dotenv').config();
const { respond, getBody, track } = require('serverless-helpers');

module.exports.track = async event => {
  const { userId, name, data } = getBody(event);
  console.log({ userId, event: name, properties: data });
  await track({ userId, event: name, properties: data });
  return respond(200);
};

module.exports.health = async event => {
  return respond(200, `hello`);
};
