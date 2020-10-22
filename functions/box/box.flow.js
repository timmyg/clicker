// @flow
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const moment = require('moment');
const { Model } = require('dynamodb-toolbox');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();
const uuid = require('uuid/v1');

const Box = new Model('Box', {
  table: process.env.tableBox,
  partitionKey: 'locationId',
  sortKey: 'id',
  schema: {
    // dayType: { type: 'string', alias: 'id' },
    // timestamp: { type: 'string' },
    // entity: { type: 'map' },
    // id: String,
    zone: { type: 'string' },
    label: { type: 'string' }, // physical label id on tv (defaults to locationName)
    info: {
      clientAddress: { type: 'string' }, // dtv calls this clientAddr
      locationName: { type: 'string' }, // dtv name
      ip: { type: 'string' },
      notes: { type: 'string' },
    },
    configuration: {
      appActivetype: {type: 'boolean'},
      automationActivetype: {type: 'boolean'}, // new
    },
    live: {
      lockedtype: {type: 'boolean'}, // new, dynamic
      lockedUntil: {type: 'number'}, // date
      // lockedProgrammingId: { type: 'string' },
      lockedProgrammingIds: {
        type: 'list',
        // list: [
        //   {
        //     type: 'string',
        //   },
        ],
      },
      lockedMessage: { type: 'string' },
      channelChangeSource: {
        type: { type: 'string' },
        // enum: [zapTypes.app, zapTypes.automation, zapTypes.manual],
      },
      channel: {type: 'number'},
      channelMinor: {type: 'number'},
      channelChangeAt: {type: 'number'}, // date
      // program: Map, // populated every few minutes
    },
    updatedAt: {type: 'number'}, // date
    updatedSource: { type: 'string' },
  },
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
    const locationId = uuid();
    const id = uuid();
    const zone = "4";
    const item = Box.put({ locationId, id, zone });
    const result = await DocumentClient.put(item).promise();
    return respond(200, result);
});
