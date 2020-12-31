import { getBody, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
const uuid = require('uuid/v1');
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, 'ok');
});

export const fetchBoxProgram = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('event', JSON.stringify(event));
  const { channel, channelMinor, region } = event.source;
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

export const query = RavenLambdaWrapper.handler(Raven, async event => {
  const { query, variables } = getBody(event);
  const gqlQuery = getGraphqlClient().query({
    query,
    variables,
  });
  console.time('query');
  const { data } = await gqlQuery;
  console.timeEnd('query');
  return respond(200, data);
});

export const mutation = RavenLambdaWrapper.handler(Raven, async event => {
  const { mutation, variables } = getBody(event);
  const gqlMutation = getGraphqlClient().mutate({
    mutation,
    variables,
  });
  console.time('mutation');
  const { data } = await gqlMutation;
  console.timeEnd('mutation');
  return respond(200, data);
});

// export const getBox = RavenLambdaWrapper.handler(Raven, async event => {
//   const { locationId, boxId } = getBody(event);
//   const graphqlClient = getGraphqlClient();
//   const query = gql(`
//     query box($id: ID!, $locationId: String!)
//       {
//         box(id: $id, locationId: $locationId) {
//           id
//           info {
//             ip
//           }
//         }
//       }
//   `);
//   const gqlQuery = graphqlClient.query({
//     query,
//     variables: {
//       id: boxId,
//       locationId,
//     },
//   });
//   console.time('query');
//   const { data } = await gqlQuery;
//   console.timeEnd('query');
//   return respond(200, data.box);
// });

// export const getBoxes = RavenLambdaWrapper.handler(Raven, async event => {

// });

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
  return respond(200, result.deleteBox);
});

export const createBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxes, region } = getBody(event);
  // const boxes = getBody(event);
  const graphqlClient = getGraphqlClient();

  const boxesCreated = [];
  for (let newBox of boxes) {
    const mutation = gql(
      `mutation addBox($id: ID!, $locationId: String!, $region: String!, $label: String, $zone: String, $info: BoxInfoInput!, $configuration: BoxConfigurationInput!, $live: BoxLiveInput){
        addBox(id: $id, locationId: $locationId, label: $label, region: $region, zone: $zone, info: $info, configuration: $configuration, live: $live){
          id
          locationId
        }
      }`,
    );
    console.time('create');
    newBox.locationId = locationId;
    newBox.id = uuid();
    newBox.region = region;
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

export const updateBoxLive = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId, live } = getBody(event);
  const graphqlClient = getGraphqlClient();

  // https://github.com/serverless/serverless-graphql/blob/master/app-backend/appsync
  const mutation = gql(
    `mutation updateBoxLive($id: ID!, $locationId: String!, $live: BoxLiveInput!){
      updateBoxLive(id: $id, locationId: $locationId, live: $live){
        id
        locationId
        live {
          channel
          locked
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
      channelChangeSource: live.channelChangeSource,
      lockedProgrammingIds: live.lockedProgrammingIds,
      lockedUntil: live.lockedUntil,
      region: live.region,
      updatedAt: live.updatedAt,
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
  return respond(200, result.data.updateBoxLive);
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
