// @flow
const Airtable = require('airtable');
const moment = require('moment');
const { respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const airtableControlCenter = 'Control Center';

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.controlCenterRun = RavenLambdaWrapper.handler(Raven, async event => {
  await new Invoke()
    .service('location')
    .name('controlCenter')
    .async()
    .go();
  return respond(200);
});
