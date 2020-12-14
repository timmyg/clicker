import { getBody, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
const uuid = require('uuid/v1');
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, 'ok');
});

export const fetchBoxProgram = RavenLambdaWrapper.handler(Raven, async event => {
  const { channel, channelMinor } = event.source;
  // TODO need region
  const region = 'cincinnati';

  if (channel) {
    const queryParams = { channel, channelMinor, region };
    console.log({ queryParams });
    const programResult = await new Invoke()
      .service('program')
      .name('get')
      .queryParams(queryParams)
      .go();
    return programResult && programResult.data;
  }
});

export const fetchBoxProgramGame = RavenLambdaWrapper.handler(Raven, async event => {
  console.log(event.source);
  const { gameId } = event.source;
  if (gameId) {
    const result = await new Invoke()
      .service('game')
      .name('get')
      .pathParams({ id: gameId })
      .go();
    return result && result.data;
  }
});

export const getBox = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getBody(event);
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

export const getBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId } = getBody(event);
  const graphqlClient = getGraphqlClient();
  const query = gql(`
    query boxes($locationId: String!)
      {
        boxes(locationId: $locationId) {
          id
          configuration {
            automationActive
            appActive
          }
          info {
            ip
            clientAddress
          }
          label
          zone
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
  console.log({ data });
  return respond(200, data.boxes);
});

export const removeBox = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getBody(event);
  const graphqlClient = getGraphqlClient();

  const mutation = gql(
    `mutation deleteBox($id: ID!, $locationId: String!){
      deleteBox(id: $id, locationId: $locationId){
        id
      }
    }`,
  );
  const gqlMutation = graphqlClient.mutate({
    mutation,
    variables: {
      locationId,
      id: boxId,
    },
  });
  const result = await gqlMutation;
  return respond(200, result);
});

export const createBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxes } = getBody(event);
  // const boxes = getBody(event);
  const graphqlClient = getGraphqlClient();

  const boxesCreated = [];
  for (let newBox of boxes) {
    const mutation = gql(
      `mutation addBox($id: ID!, $locationId: String!, $label: String, $zone: String, $info: BoxInfoInput!, $configuration: BoxConfigurationInput!){
        addBox(id: $id, locationId: $locationId, label: $label, zone: $zone, info: $info, configuration: $configuration){
          id
          locationId
        }
      }`,
    );
    console.time('create');
    newBox.locationId = locationId;
    newBox.id = uuid();
    console.log({ newBox });
    const gqlMutation = graphqlClient.mutate({
      mutation,
      variables: newBox,
    });
    console.timeEnd('create');
    const { data } = await gqlMutation;
    boxesCreated.push(data.addBox);
  }
  return respond(201, boxesCreated);
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
