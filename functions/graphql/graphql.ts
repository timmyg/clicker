import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
const uuid = require('uuid/v1');
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, 'ok');
});
