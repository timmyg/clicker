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
    entity: { type: 'map' },
  },
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { type, entity } = getBody(event);
  console.log({ type, entity });
  const timestamp = moment().unix() * 1000;
  const date = moment().format('YYYYMMDD');
  const dayType = `${date}-${type}`;
  const item = Audit.put({ dayType, timestamp, entity });
  const result = await DocumentClient.put(item).promise();
  return respond(200, result);
});
