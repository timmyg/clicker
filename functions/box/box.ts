import { respond, Raven, RavenLambdaWrapper } from 'serverless-helpers';
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
import vals from '../shared/test';
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, { vals });
});

export const create = RavenLambdaWrapper.handler(Raven, async event => {
  const { graphqlApiUrl, graphqlApiKey, region } = process.env;
  console.log(graphqlApiUrl, region, graphqlApiKey);
  const graphqlClient = new appsync.AWSAppSyncClient({
    url: graphqlApiUrl,
    region: region,
    auth: {
      type: appsync.AUTH_TYPE.API_KEY,
      apiKey: graphqlApiKey,
    },
    disableOffline: true,
  });

  console.log('1');
  const result = await graphqlClient.mutate({
    mutation: gql(`mutation addBox($id: ID!, $locationId: String!, $zone: String!){
      addBox(id: $id, locationId: $locationId, zone: $zone){
        id
        locationId
      }
    }`),
    variables: {
      id: '4534534',
      locationId: '34343',
      zone: '54654654',
    },
  });
  console.log('2', { result });
  return respond(200, 'hi');
});
