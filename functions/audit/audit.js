//      
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

// const Audit = dynamo.define(process.env.tableAudit, {
//   hashKey: 'date',
//   rangeKey: 'entityId',

//   // add the timestamp attributes (updatedAt, createdAt)
//   timestamps: true,

//   schema: {
//     date: Joi.string(),
//     entityId: Joi.string(),
//     type: Joi.string(),
//   },
// });

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { date, entityId, type } = getBody(event);
  var audit = new Audit({ date, entityId, type });
  const result = await audit.save();
  return respond(200, result);
});
