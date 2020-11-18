import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper } from 'serverless-helpers';
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
const uuid = require('uuid/v1');
import vals from '../shared/test';
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, { vals });
});

function getGraphqlClient() {
  const { graphqlApiUrl, graphqlApiKey, region } = process.env;

  return new appsync.AWSAppSyncClient({
    url: graphqlApiUrl,
    region: region,
    auth: {
      type: appsync.AUTH_TYPE.API_KEY,
      apiKey: graphqlApiKey,
    },
    disableOffline: true,
  });
}

class DirectvBox {
  major: number;
  minor: number;
  clientAddr: string;
  locationName: string;
}

class DirectvBoxRequest {
  boxes: DirectvBox[];
  ip: string;
}

export const create = RavenLambdaWrapper.handler(Raven, async event => {
  const { ip, boxes }: DirectvBoxRequest = getBody(event);
  const { locationId } = event.queryStringParameters;

  const graphqlClient = getGraphqlClient();
  const result = await graphqlClient.mutate({
    mutation: gql(`mutation addBox($id: ID!, $locationId: String!, $info: BoxInfoInput!){
      addBox(id: $id, locationId: $locationId, info: $info){
        id
        locationId
        info {
          clientAddress
        }
      }
    }`),
    variables: {
      id: uuid(),
      locationId,
      info: {
        ip: ip,
        clientAddress: boxes[0].clientAddr,
      },
    },
  });
  return respond(200, result);
});

export const get = RavenLambdaWrapper.handler(Raven, async event => {
  // const { id } = getPathParameters(event);
  // const { locationId } = event.queryStringParameters;

  const graphqlClient = getGraphqlClient();
  // const query = gql(`query GetBox($id: ID!, $locationId: String!) {
  //   getBox($id: ID!, $locationId: String!) {
  //     id
  //     locationId
  //   }
  // }`)
  const query = gql(`
    {
      box {
        name
      }
    }
  `);
  const result = await graphqlClient.query({
    query,
    // variables: {
    //   id,
    //   locationId,
    // },
  });
  return respond(200, result);
});
