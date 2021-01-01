// @flow
const axios = require('axios');
const { respond, getBody, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

module.exports.track = RavenLambdaWrapper.handler(Raven, async event => {
  const { userId, name, data, timestamp } = getBody(event);
  // add in time
  data.date = new Date().toISOString();
  const body = { userId, event: name, properties: data };
  if (timestamp) {
    body.timestamp = timestamp;
  }
  const options = {
    auth: {
      username: process.env.segmentWriteKey,
    },
  };

  console.log('https://api.segment.io/v1/track', body, options);
  console.time('track event');
  const result = await axios.post('https://api.segment.io/v1/track', body, options);
  console.timeEnd('track event');
  console.log(result);
  return respond(200);
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});
