// @flow
require('dotenv').config();
const axios = require('axios');
const { respond, getBody } = require('serverless-helpers');
const analytics = new (require('analytics-node'))(process.env.segmentWriteKey || process.env.SEGMENT_WRITE_KEY);

module.exports.track = async (event: any) => {
  const { userId, name, data } = getBody(event);
  // console.log({ userId, event: name, properties: data });
  // await track({ userId, event: name, properties: data });
  await axios.post('https://api.segment.io/v1/track', { userId, event: name, properties: data });
  return respond(200);
};

module.exports.health = async (event: any) => {
  return respond(200, `hello`);
};
