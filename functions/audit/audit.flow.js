// @flow
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const moment = require('moment');
const { Model } = require('dynamodb-toolbox');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const Audit = new Model('Audit', {
  table: process.env.tableAudit,
  partitionKey: 'dayType',
  sortKey: 'timestamp',
  schema: {
    dayType: { type: 'string', alias: 'id' },
    timestamp: { type: 'string' },
    reservation: { type: 'map' },
  },
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { type, reservation } = getBody(event);
  console.log({ type, reservation });
  const timestamp = moment().unix() * 1000;
  const date = moment().format('YYYYMMDD');
  const dateType = `${date}-${type}`;
  const item = Audit.put({ dateType, timestamp, reservation });
  const result = await DocumentClient.put(item).promise();
  return respond(200, result);
});
