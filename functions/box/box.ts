import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
const uuid = require('uuid/v1');
import vals from '../shared/example';
const gql = require('graphql-tag');
require('cross-fetch/polyfill');

export const health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, { vals });
});

export const get = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, boxId } = getPathParameters(event);

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

  const variables = {
    id: boxId,
    locationId,
  };
  const result = await new Invoke()
    .service('graphql')
    .name('query')
    .body({ query, variables })
    .sync()
    .go();

  console.log({ result });

  return respond(200, result.data.box);
});

export const getAll = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId } = getPathParameters(event);
  const fetchProgram = (event.queryStringParameters && event.queryStringParameters.fetchProgram) || false;

  const query = gql(`
    query boxes($locationId: String!, $fetchProgram: Boolean!)
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
          live {
            channel
            channelChangeSource
            channelChangeAt
            lockedUntil
            lockedProgrammingIds
            region
            program @include(if: $fetchProgram) {
              title
              start
              clickerRating
              channel
              channelMinor
              gameId
              game {
                isOver
                title
                status
                statusDisplay
              }
            }
            locked
          }
          label
          zone
          region
        }
      }
  `);

  const variables = {
    locationId,
    fetchProgram,
  };

  console.log({ query, variables });

  console.log('1');
  const result = await new Invoke()
    .service('graphql')
    .name('query')
    .body({ query, variables })
    .sync()
    .go();
  console.log('2');

  return respond(200, !result || !result.data ? [] : result.data.boxes);
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

  console.log({ locationId, boxId, live });

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
