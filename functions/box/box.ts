import { getBody, respond, Raven, RavenLambdaWrapper } from 'serverless-helpers';
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
  const data: DirectvBoxRequest = getBody(event);
  console.log({ event });
  const { locationId } = event.queryStringParameters;
  console.log({ locationId });

  const graphqlClient = getGraphqlClient();

  const result = await graphqlClient.mutate({
    mutation: gql(`mutation addBox($id: ID!, $locationId: String!, $zone: String!){
      addBox(id: $id, locationId: $locationId, zone: $zone){
        id
        locationId
      }
    }`),
    variables: {
      id: uuid(),
      locationId,
      info: {
        ip: data.ip,
        clientAddress: data.boxes[0].clientAddr,
      },
    },
  });
  console.log('2', { result });
  return respond(200, 'hi');
});
