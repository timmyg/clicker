// @flow
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const dynamo = require('dynamodb');
const Joi = require('@hapi/joi');
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
const Audit = dynamo.define(process.env.tableAudit, {
  hashKey: 'dateDay',
  rangeKey: 'dateTimestamp',

  // add the timestamp attributes (updatedAt, createdAt)
  timestamps: true,

  schema: {
    dateDay: Joi.string(),
    dateTimestamp: Joi.string(),
    entity: Joi.string(),
    entityId: Joi.string(),
    locationId: Joi.string(),
  },
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { dateDay, dateTimestamp, entity, entityId, locationId } = getBody(event);
  console.log({ dateDay, dateTimestamp, entity, entityId, locationId });
  var audit = new Audit({ dateDay, dateTimestamp, entity, entityId, locationId });
  const result = await audit.save();
  return respond(200, result);
});
