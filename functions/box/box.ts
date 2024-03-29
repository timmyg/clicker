import { getBody, getPathParameters, respond, Invoke } from 'serverless-helpers';
const uuid = require('uuid/v1');
import vals from '../shared/example';
const gql = require('graphql-tag');
const withSentry = require('serverless-sentry-lib');
// require('cross-fetch/polyfill');

export const health = withSentry(async (event) => {
  return respond(200, { vals });
});

export const get = withSentry(async (event) => {
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
  const result = await new Invoke().service('graphql').name('query').body({ query, variables }).sync().go();

  console.log({ result });

  return respond(200, result.data.box);
});

export const getAll = withSentry(async (event) => {
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
            updatedAt
            program @include(if: $fetchProgram) {
              title
              channelTitle
              start
              end
              clickerRating
              channel
              channelMinor
              gameId
              mainCategory
              live
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

  const result = await new Invoke().service('graphql').name('query').body({ query, variables }).sync().go();

  return respond(200, !result || !result.data ? [] : result.data.boxes);
});

export const remove = withSentry(async (event) => {
  const { locationId, boxId } = getPathParameters(event);

  const mutation = gql(
    `mutation deleteBox($id: ID!, $locationId: String!){
      deleteBox(id: $id, locationId: $locationId){
        id
      }
    }`,
  );

  const variables = {
    locationId,
    id: boxId,
  };

  const result = await new Invoke().service('graphql').name('mutate').body({ mutation, variables }).sync().go();

  return respond(200, result.deleteBox);
});

export const create = withSentry(async (event) => {
  const { locationId } = getPathParameters(event);
  const boxes = getBody(event);

  console.log({ locationId });
  const { data: locationData } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: locationId })
    .sync()
    .go();

  console.log({ locationData });

  const boxesCreated = [];
  for (let newBox of boxes) {
    const mutation = gql(
      `mutation addBox($id: ID!, $locationId: String!, $region: String!, $label: String, $zone: String, $info: BoxInfoInput!, $configuration: BoxConfigurationInput!, $live: BoxLiveInput!){
        addBox(id: $id, locationId: $locationId, label: $label, region: $region, zone: $zone, info: $info, configuration: $configuration, live: $live){
          id
          locationId
          live {
            channel
          }
        }
      }`,
    );
    newBox.locationId = locationId;
    newBox.id = uuid();
    newBox.region = locationData.region;
    newBox.live = {
      channel: 0,
      channelChangeSource: 'manual',
      region: locationData.region,
    };

    const variables = newBox;
    console.log(variables);

    const result = await new Invoke().service('graphql').name('mutate').body({ mutation, variables }).sync().go();

    boxesCreated.push(result.data.addBox);
  }
  return respond(201, boxesCreated);
});

export const createDirectv = withSentry(async (event) => {
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
    label: Math.random().toString(36).substr(2, 2),
    zone: Math.random().toString(36).substr(2, 2),
    live: {
      channel: 0,
      channelChangeSource: 'manual',
      region: location.region,
    },
  };
  console.log({ locationId });
  console.log([newBox]);
  console.log({ region: location.region });

  const { data } = await new Invoke().service('box').name('create').pathParams({ locationId }).body([newBox]).go();

  return respond(200, data);
});

export const updateLive = withSentry(async (event) => {
  const { locationId, boxId } = getPathParameters(event);
  const live = getBody(event);

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

  const result = await new Invoke().service('graphql').name('mutate').body({ mutation, variables }).sync().go();

  return respond(200, result.data.updateBoxLive);
});

import DirectvBox from '../models/directvBox';

class DirectvBoxRequest {
  boxes: DirectvBox[];
  ip: string;
}
