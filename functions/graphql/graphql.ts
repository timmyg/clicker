import { getBody, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
const appsync = require('aws-appsync');
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
  console.log({ query: JSON.stringify(query), variables });
  console.time('query');
  const { data } = await gqlQuery;
  console.timeEnd('query');
  return respond(200, data);
});

export const mutate = RavenLambdaWrapper.handler(Raven, async event => {
  const { mutation, variables } = getBody(event);
  const gqlMutation = getGraphqlClient().mutate({
    mutation,
    variables,
  });
  console.log({ mutation: JSON.stringify(mutation), variables });
  console.time('mutation');
  const { data } = await gqlMutation;
  console.timeEnd('mutation');
  return respond(200, data);
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
