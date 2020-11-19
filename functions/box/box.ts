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

  const mutation = gql(
    `mutation addBox($id: ID!, $locationId: String!, $info: BoxInfoInput!){
      addBox(id: $id, locationId: $locationId, info: $info){
        id
        locationId
        info {
          clientAddress
        }
      }
    }`,
  );
  console.time('create');
  const gqlMutation = graphqlClient.mutate({
    mutation,
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
  const result = await gqlMutation;
  return respond(200, result);
});

export const get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id, locationId } = event.queryStringParameters;
  const graphqlClient = getGraphqlClient();
  const query = gql(`
    query box($id: ID!, $locationId: String!)
      {
        box(id: $id, locationId: $locationId) {
          id
          info {
            ip
          }
        }
      }
  `);
  const gqlQuery = graphqlClient.query({
    query,
    variables: {
      id,
      locationId,
    },
  });
  console.time('query');
  const { data } = await gqlQuery;
  console.timeEnd('query');
  return respond(200, data.box);
});
