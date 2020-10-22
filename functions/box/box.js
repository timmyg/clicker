//      
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const moment = require('moment');
const { Model } = require('dynamodb-toolbox');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();
const uuid = require('uuid/v5');
// import vals from '../shared/test';
const vals =  require('../shared/test');

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
        type: 'map'
    //   clientAddress: { type: 'string' }, // dtv calls this clientAddr
    //   locationName: { type: 'string' }, // dtv name
    //   ip: { type: 'string' },
    //   notes: { type: 'string' },
    },
    configuration: {
        type: 'map'
    //   appActivetype: {type: 'boolean'},
    //   automationActivetype: {type: 'boolean'}, // new
    },
    live: {
        type: 'map'
    //   lockedtype: {type: 'boolean'}, // new, dynamic
    //   lockedUntil: {type: 'number'}, // date
    //   // lockedProgrammingId: { type: 'string' },
    //   lockedProgrammingIds: {
    //     type: 'list',
    //     // list: [
    //     //   {
    //     //     type: 'string',
    //     //   },
    //     // ],
    //   },
    //   lockedMessage: { type: 'string' },
    //   channelChangeSource: {
    //     type: { type: 'string' },
    //     // enum: [zapTypes.app, zapTypes.automation, zapTypes.manual],
    //   },
    //   channel: {type: 'number'},
    //   channelMinor: {type: 'number'},
    //   channelChangeAt: {type: 'number'}, // date
    //   // program: Map, // populated every few minutes
    },
    updatedAt: {type: 'number'}, // date
    updatedSource: { type: 'string' },
  },
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, {vals});
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
    const locationId = uuid();
    const id = uuid();
    const zone = "4";
    const item = Box.put({ locationId, id, zone });
    const result = await DocumentClient.put(item).promise();
    return respond(200, result);
});
