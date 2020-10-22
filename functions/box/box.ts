import vals from '../shared/test';
import { getBody, respond, Invoke, Raven, RavenLambdaWrapper } from 'serverless-helpers';
import moment from 'moment';
import { Model } from 'dynamodb-toolbox';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import uuid from 'uuid/v1';
const DocumentClient = new DynamoDB.DocumentClient();

const Box = new Model('Box', {
  table: process.env.tableBox,
  partitionKey: 'locationId',
  sortKey: 'id',
  schema: {
    locationId: { type: 'string' },
    id: { type: 'string' },
    // entity: { type: 'map' },
    // id: String,
    zone: { type: 'string' },
    label: { type: 'string' }, // physical label id on tv (defaults to locationName)
    info: {
      type: 'map',
      //   clientAddress: { type: 'string' }, // dtv calls this clientAddr
      //   locationName: { type: 'string' }, // dtv name
      //   ip: { type: 'string' },
      //   notes: { type: 'string' },
    },
    configuration: {
      type: 'map',
      //   appActivetype: {type: 'boolean'},
      //   automationActivetype: {type: 'boolean'}, // new
    },
    live: {
      type: 'map',
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
    updatedAt: { type: 'number' }, // date
    updatedSource: { type: 'string' },
  },
});

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, { vals });
});

export const create = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('hi');
  const locationId = uuid();
  const id = uuid();
  const zone = '4';
  console.log({ locationId, id, zone });
  const item = Box.put({ locationId, id, zone });
  console.log({ item });
  const result = await DocumentClient.put(item).promise();
  console.log(result);
  return respond(200, 'hi');
});
