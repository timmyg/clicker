// @flow
const axios = require('axios');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

const { respond, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const plans = [
  { tokens: 2, dollars: 10, id: 'bb23310b-3fec-4873-8cdf-279ffcd31b32' },
  { tokens: 5, dollars: 20, id: '40167d6a-1626-456a-8a35-f60c91c05120' },
  {
    tokens: 10,
    dollars: 30,
    id: 'd25f930b-7c3a-4ea2-b41b-9ae959135c6a',
    best: true,
  },
];
const timeframes = [{ tokens: 1, minutes: 5 }, { tokens: 2, minutes: 60 }, { tokens: 4, minutes: 120 }];

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.buy = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, plans);
});

module.exports.timeframes = RavenLambdaWrapper.handler(Raven, async event => {
  console.log(event.queryStringParameters.locationId);
  // locationId should be available in query params
  return respond(200, timeframes);
});

// module.exports.blogPostUpdated = RavenLambdaWrapper.handler(Raven, async event => {
//   const stage = process.env.stage;
//   console.log(stage);
//   if (stage === 'prod') {
//     const response = await axios.post('https://api.netlify.com/build_hooks/5c7458709c6a819dd611ee82', {});
//     return respond(200, 'ok');
//   }
//   return respond(400);
// });
