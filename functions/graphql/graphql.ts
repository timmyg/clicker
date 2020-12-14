import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
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
