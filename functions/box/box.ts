import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
// const appsync = require('aws-appsync');
// const gql = require('graphql-tag');
const uuid = require('uuid/v1');
import vals from '../shared/example';
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, { vals });
});

export const get = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getPathParameters(event);

  const result = await new Invoke()
    .service('graphql')
    .name('getBox')
    .body({ locationId, boxId })
    .sync()
    .go();

  return respond(200, result.data);
});

export const getAll = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId } = getPathParameters(event);

  const result = await new Invoke()
    .service('graphql')
    .name('getBoxes')
    .body({ locationId })
    .sync()
    .go();

  console.log({ result });

  return respond(200, result.data);
});

export const remove = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getPathParameters(event);

  const { data } = await new Invoke()
    .service('graphql')
    .name('removeBox')
    .body({ locationId, boxId })
    .sync()
    .go();

  return respond(200, data);
});

export const create = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId } = getPathParameters(event);

  console.log({ locationId });
  const { data: locationData } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: locationId })
    .sync()
    .go();

  console.log({ locationData });

  const boxes = getBody(event);
  const { data } = await new Invoke()
    .service('graphql')
    .name('createBoxes')
    .body({ locationId, boxes, region: locationData.region })
    .sync()
    .go();

  return respond(201, data);
});

export const createDirectv = RavenLambdaWrapper.handler(Raven, async event => {
  const { ip, boxes }: DirectvBoxRequest = getBody(event);
  const { locationId } = getPathParameters(event);

  const { data: location } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: locationId })
    .sync()
    .go();

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

  console.log({ location });

  const { data } = await new Invoke()
    .service('graphql')
    .name('createBoxes')
    .body({ locationId, boxes: [newBox], region: location.region })
    .go();

  return respond(200, data);
});

export const updateLive = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getPathParameters(event);
  const live = getBody(event);

  const { data } = await new Invoke()
    .service('graphql')
    .name('updateBoxLive')
    .body({ locationId, boxId, live })
    .go();

  return respond(200, data);
});

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
