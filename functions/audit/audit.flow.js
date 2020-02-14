// @flow
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');

// declare class process {
//   static env: {
//     airtableKey: string,
//     airtableBase: string,
//     circleToken: string,
//     stage: string,
//   };
// }

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const body = getBody(event);
  return respond(200), 200;
});
