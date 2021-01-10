import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
const uuid = require('uuid/v1');
const gql = require('graphql-tag');
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, 'hello!');
});

export const getByLocation = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, 'hello!');
});
