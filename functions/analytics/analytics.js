require('dotenv').config();
const { respond, getBody, track } = require('serverless-helpers');

module.exports.track = async event => {
  console.log('1.');
  const { userId, name, data } = getBody(event);
  console.log('2.');
  await track({ userId, event: name, properties: data });
  console.log('3.');
  return respond(200);
};

module.exports.health = async event => {
  return respond(200, `hello`);
};
