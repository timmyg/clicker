import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper } from 'serverless-helpers';
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
const uuid = require('uuid/v1');
import vals from '../shared/example';
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
    `mutation addBox($id: ID!, $locationId: String!, $info: BoxInfoInput!, $configuration: BoxConfigurationInput!){
      addBox(id: $id, locationId: $locationId, info: $info, configuration: $configuration){
        id
        locationId
        info {
          clientAddress
        }
        configuration {
          appActive
        }
      }
    }`,
  );
  console.time('create');
  const box = {
    id: uuid(),
    locationId,
    configuration: {
      appActive: false,
      automationActive: false
    },
    info: {
      ip,
      clientAddress: boxes[0].clientAddr,
      locationName: boxes[0].locationName,
    },
    live: {}
  }
  console.log({box});
  const gqlMutation = graphqlClient.mutate({
    mutation,
    variables: box,
  });
  console.timeEnd('create');
  const result = await gqlMutation;
  return respond(200, result);
});

export const get = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getPathParameters(event);
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
      id: boxId,
      locationId,
    },
  });
  console.time('query');
  const { data } = await gqlQuery;
  console.timeEnd('query');
  return respond(200, data);
});

export const getAll = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId } = getPathParameters(event);
  const graphqlClient = getGraphqlClient();
  const query = gql(`
    query boxes($locationId: String!)
      {
        boxes(locationId: $locationId) {
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
      locationId,
    },
  });
  console.log({locationId});
  console.time('query');
  const { data } = await gqlQuery;
  console.timeEnd('query');
  return respond(200, data);
});