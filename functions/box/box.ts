import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
const uuid = require('uuid/v1');
import vals from '../shared/example';
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, { vals });
});

export const fetchBoxProgram = RavenLambdaWrapper.handler(Raven, async event => {
  const { channel, channelMinor } = event.source;
  // TODO need region
  const region = 'cincinnati';
  const queryParams = { channel, channelMinor, region };
  console.log({ queryParams });
  const programResult = await new Invoke()
    .service('program')
    .name('get')
    .queryParams(queryParams)
    .go();
  const program = programResult && programResult.data;

  return program;
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
  const { locationId } = getPathParameters(event);
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
  const newBox = {
    id: uuid(),
    locationId,
    configuration: {
      appActive: false,
      automationActive: false,
    },
    info: {
      ip,
      clientAddress: boxes[0].clientAddr,
      locationName: boxes[0].locationName,
    },
    label: Math.random()
      .toString(36)
      .substr(2, 2),
    zone: Math.random()
      .toString(36)
      .substr(2, 2),
    live: {},
  };
  console.log({ newBox });
  const gqlMutation = graphqlClient.mutate({
    mutation,
    variables: newBox,
  });
  console.timeEnd('create');
  const result = await gqlMutation;
  return respond(200, result.data.addBox);
});

export const updateChannel = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getPathParameters(event);
  const live = getBody(event);
  const graphqlClient = getGraphqlClient();

  // https://github.com/serverless/serverless-graphql/blob/master/app-backend/appsync
  const mutation = gql(
    `mutation updateBoxChannel($id: ID!, $locationId: String!, $live: BoxLiveInput!){
      updateBoxChannel(id: $id, locationId: $locationId, live: $live){
        id
        locationId
        live {
          channel
        }
      }
    }`,
  );
  console.time('create');

  const variables = {
    live: {
      channel: live.channel,
      channelMinor: live.channelMinor,
      channelChangeAt: live.channelChangeAt,
      channelChangeSource: live.source,
    },
    id: boxId,
    locationId,
  };
  console.log({ variables });
  const gqlMutation = graphqlClient.mutate({
    mutation,
    variables,
  });
  console.timeEnd('create');
  const result = await gqlMutation;
  return respond(200, result.data.addBox);
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
  return respond(200, data.box);
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
            clientAddress
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
  console.log({ locationId });
  console.time('query');
  const { data } = await gqlQuery;
  console.timeEnd('query');
  return respond(200, data);
});
