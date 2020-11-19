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
  console.time('create');
  const result = await graphqlClient.mutate({
    mutation: gql(
      `mutation addBox($id: ID!, $locationId: String!, $info: BoxInfoInput!){
        addBox(id: $id, locationId: $locationId, info: $info){
          id
          locationId
          info {
            clientAddress
          }
        }
      }`,
    ),
    variables: {
      id: uuid(),
      locationId,
      info: {
        ip: ip,
        clientAddress: boxes[0].clientAddr,
      },
    },
  });
  console.timeEnd('create');
  return respond(200, result);
});

export const get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id, locationId } = event.queryStringParameters;
  const graphqlClient = getGraphqlClient();
  const query = gql(`
    query box($id: ID!, $locationId: String!)
      {
        box(id: $id, locationId: $locationId) {
          info {
            ip
          }
        }
      }
  `);
  console.time('query');
  const result = await graphqlClient.query({
    query,
    variables: {
      id,
      locationId,
    },
  });
  console.timeEnd('query');
  return respond(200, result);
});
