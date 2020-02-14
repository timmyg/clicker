// @flow
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const { Model } = require('dynamodb-toolbox');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();
// let dynamo = require('dynamodb');
// // const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
// console.log(AWS_ACCESS_KEY_ID.substring(0, 4), AWS_SECRET_ACCESS_KEY.substring(0, 4), AWS_REGION.substring(0, 4));
// dynamo.AWS.config.update({
//   accessKeyId: AWS_ACCESS_KEY_ID,
//   secretAccessKey: AWS_SECRET_ACCESS_KEY,
//   region: AWS_REGION,
// });
// const Joi = require('@hapi/joi');
// declare class process {
//   static env: {
//     airtableKey: string,
//     airtableBase: string,
//     circleToken: string,
//     stage: string,
//   };
// }

// console.log({ dynamo }, { env: process.env });
// dynamo.AWS.config.update({ region: 'us-east-1' });
console.log({ table: process.env.tableAudit });
// const Audit = dynamo.define(process.env.tableAudit, {
//   hashKey: 'dateDay',
//   rangeKey: 'dateTimestamp',

//   // add the timestamp attributes (updatedAt, createdAt)
//   timestamps: true,

//   schema: {
//     dateDay: Joi.string(),
//     dateTimestamp: Joi.string(),
//     entity: Joi.string(),
//     entityId: Joi.string(),
//     locationId: Joi.string(),
//   },
// });
const Audit = new Model('Audit', {
  // Specify table name
  table: process.env.tableAudit,

  // Define partition and sort keys
  partitionKey: 'dateDay',
  sortKey: 'dateTimestamp',

  // Define schema
  schema: {
    dateDay: { type: 'string', alias: 'id' },
    dateTimestamp: { type: 'string', hidden: true },
    entity: { type: 'string' },
    entityId: { type: 'string' },
    locationId: { type: 'string' },
    // data: { type: 'string', alias: 'name' },
    // status: ['sk',0], // composite key mapping
    // date_added: ['sk',1] // composite key mapping
  },
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { dateDay, dateTimestamp, entity, entityId, locationId } = getBody(event);
  console.log({ dateDay, dateTimestamp, entity, entityId, locationId });
  const item = Audit.put({ dateDay, dateTimestamp, entity, entityId, locationId });
  const result = await DocumentClient.put(item).promise();
  return respond(200, result);
});
