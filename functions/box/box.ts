import vals from '../shared/test';
import { respond, Raven, RavenLambdaWrapper } from 'serverless-helpers';
import { Model } from 'dynamodb-toolbox';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import uuid from 'uuid/v1';
const DocumentClient = new DynamoDB.DocumentClient();
const gql = require('graphql-tag');
const AWSAppSyncClient = require('aws-appsync').default;
// const x = require('aws-appsync');
import { AUTH_TYPE } from 'aws-appsync';

// global.fetch = require('node-fetch');
require('isomorphic-fetch');
require('es6-promise').polyfill();

// const Box = new Model('Box', {
//   table: process.env.tableBox,
//   partitionKey: 'locationId',
//   sortKey: 'id',
//   schema: {
//     locationId: { type: 'string' },
//     id: { type: 'string' },
//     // entity: { type: 'map' },
//     // id: String,
//     zone: { type: 'string' },
//     label: { type: 'string' }, // physical label id on tv (defaults to locationName)
//     info: {
//       type: 'map',
//       //   clientAddress: { type: 'string' }, // dtv calls this clientAddr
//       //   locationName: { type: 'string' }, // dtv name
//       //   ip: { type: 'string' },
//       //   notes: { type: 'string' },
//     },
//     configuration: {
//       type: 'map',
//       //   appActivetype: {type: 'boolean'},
//       //   automationActivetype: {type: 'boolean'}, // new
//     },
//     live: {
//       type: 'map',
//       //   lockedtype: {type: 'boolean'}, // new, dynamic
//       //   lockedUntil: {type: 'number'}, // date
//       //   // lockedProgrammingId: { type: 'string' },
//       //   lockedProgrammingIds: {
//       //     type: 'list',
//       //     // list: [
//       //     //   {
//       //     //     type: 'string',
//       //     //   },
//       //     // ],
//       //   },
//       //   lockedMessage: { type: 'string' },
//       //   channelChangeSource: {
//       //     type: { type: 'string' },
//       //     // enum: [zapTypes.app, zapTypes.automation, zapTypes.manual],
//       //   },
//       //   channel: {type: 'number'},
//       //   channelMinor: {type: 'number'},
//       //   channelChangeAt: {type: 'number'}, // date
//       //   // program: Map, // populated every few minutes
//     },
//     updatedAt: { type: 'number' }, // date
//     updatedSource: { type: 'string' },
//   },
// });

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, { vals });
});

export const create = RavenLambdaWrapper.handler(Raven, async event => {
  const locationId = uuid();
  const id = uuid();
  const zone = '4';
  // console.log({ locationId, id, zone });
  // console.log(process.env.graphqlApiUrl, process.env.graphqlApiKey, process.env.region);
  const { graphqlApiUrl, graphqlApiUrl2, graphqlApiUrl3, graphqlApiKey, region } = process.env;
  // console.log({ graphqlApiUrl, x3: JSON.stringify(graphqlApiUrl), graphqlApiKey, region });
  console.log(graphqlApiUrl);
  console.log(graphqlApiUrl2);
  console.log(graphqlApiUrl3);
  console.log(JSON.stringify(graphqlApiUrl));
  // console.log(JSON.stringify(graphqlApiUrl2));

  const appsyncClient = new AWSAppSyncClient(
    {
      url: graphqlApiUrl,
      region: region,
      auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: graphqlApiKey,
      },
      disableOffline: true,
    },
    {
      defaultOptions: {
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
      },
    },
  );

  const client = await appsyncClient.hydrated();

  // const mutation = gql(`
  // mutation PutPost() {
  //   addBox(id: \"555\", locationId: \"55\", zone: \"555\") {
  //     id
  //     locationId
  //   }
  // }`);
  console.log('1');
  // const mutation2 = ;

  try {
    const result = await client.mutate({
      mutation: gql(`mutation AddBox($id: ID!, $locationId: String!, $zone: String!){
        addBox(id: $id, locationId: $locationId, zone: $zone){
          id
          locationId
        }
      }`),
      variables: {
        id: '324234',
        locationId: '23424',
        zone: '56445',
      },
    });
    console.log('2');

    console.log(JSON.stringify(result));

    return result;
  } catch (error) {
    console.log(JSON.stringify(error));
    return error;
  }

  // const item = Box.put({
  //   locationId,
  //   id,
  //   zone,
  //   info: {
  //     ip: '192.168.5.3',
  //   },
  // });
  // console.log({ item });
  // const result = await DocumentClient.put(item).promise();
  // console.log(result);
  return respond(200, 'hi');
});
