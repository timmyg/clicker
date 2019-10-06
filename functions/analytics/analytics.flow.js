// @flow
require('dotenv').config();
const axios = require('axios');
const { respond, getBody } = require('serverless-helpers');

module.exports.track = async (event: any) => {
  const { userId, name, data } = getBody(event);
  // add in time
  data.date = new Date().toISOString();
  const body = { userId, event: name, properties: data };
  const options = {
    auth: {
      username: process.env.segmentWriteKey,
    },
  };

  console.log('https://api.segment.io/v1/track', body, options);
  const result = await axios.post('https://api.segment.io/v1/track', body, options);
  console.log(result);
  return respond(200);
};

module.exports.health = async (event: any) => {
  return respond(200, `hello`);
};
