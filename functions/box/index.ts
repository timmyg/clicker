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

// export const remove = RavenLambdaWrapper.handler(Raven, async event => {
//   const { locationId, boxId } = getPathParameters(event);
//   const graphqlClient = getGraphqlClient();

//   const mutation = gql(
//     `mutation deleteBox($id: ID!, $locationId: String!){
//       deleteBox(id: $id, locationId: $locationId){
//         id
//       }
//     }`,
//   );
//   const gqlMutation = graphqlClient.mutate({
//     mutation,
//     variables: {
//       locationId,
//       id: boxId,
//     },
//   });
//   const result = await gqlMutation;
//   return respond(200, result);
// });

// export const create = RavenLambdaWrapper.handler(Raven, async event => {
//   const { locationId } = getPathParameters(event);
//   const boxes = getBody(event);
//   const graphqlClient = getGraphqlClient();

//   const boxesCreated = [];
//   for (let newBox of boxes) {
//     const mutation = gql(
//       `mutation addBox($id: ID!, $locationId: String!, $label: String, $zone: String, $info: BoxInfoInput!, $configuration: BoxConfigurationInput!){
//         addBox(id: $id, locationId: $locationId, label: $label, zone: $zone, info: $info, configuration: $configuration){
//           id
//           locationId
//         }
//       }`,
//     );
//     console.time('create');
//     newBox.locationId = locationId;
//     newBox.id = uuid();
//     console.log({ newBox });
//     const gqlMutation = graphqlClient.mutate({
//       mutation,
//       variables: newBox,
//     });
//     console.timeEnd('create');
//     const { data } = await gqlMutation;
//     boxesCreated.push(data.addBox);
//   }
//   return respond(201, boxesCreated);
// });

// export const createDirectv = RavenLambdaWrapper.handler(Raven, async event => {
//   const { ip, boxes }: DirectvBoxRequest = getBody(event);
//   const { locationId } = getPathParameters(event);

//   const newBox = {
//     id: uuid(),
//     locationId,
//     configuration: {
//       appActive: false,
//       automationActive: false,
//     },
//     info: {
//       ip,
//       clientAddress: boxes[0].clientAddr,
//       locationName: boxes[0].locationName,
//     },
//     label: Math.random()
//       .toString(36)
//       .substr(2, 2),
//     zone: Math.random()
//       .toString(36)
//       .substr(2, 2),
//     live: {},
//   };
//   console.log({ newBox });

//   const result = await new Invoke()
//     .service('box')
//     .name('create')
//     .pathParams({ locationId })
//     .body([newBox])
//     .go();

//   return respond(200, result.data.addBox);
// });

// export const updateLive = RavenLambdaWrapper.handler(Raven, async event => {
//   const { locationId, boxId } = getPathParameters(event);
//   const live = getBody(event);
//   const graphqlClient = getGraphqlClient();

//   // https://github.com/serverless/serverless-graphql/blob/master/app-backend/appsync
//   const mutation = gql(
//     `mutation updateBoxLive($id: ID!, $locationId: String!, $live: BoxLiveInput!){
//       updateBoxLive(id: $id, locationId: $locationId, live: $live){
//         id
//         locationId
//         live {
//           channel
//         }
//       }
//     }`,
//   );
//   console.time('create');

//   const variables = {
//     live: {
//       channel: live.channel,
//       channelMinor: live.channelMinor,
//       channelChangeAt: live.channelChangeAt,
//       channelChangeSource: live.channelChangeSource,
//       lockedProgrammingIds: live.lockedProgrammingIds,
//       lockedUntil: live.lockedUntil,
//     },
//     id: boxId,
//     locationId,
//   };
//   console.log({ variables });
//   const gqlMutation = graphqlClient.mutate({
//     mutation,
//     variables,
//   });
//   console.timeEnd('create');
//   const result = await gqlMutation;
//   return respond(200, result.data.addBox);
// });

// export const getAll = RavenLambdaWrapper.handler(Raven, async event => {
//   const { locationId } = getPathParameters(event);
//   const graphqlClient = getGraphqlClient();
//   const query = gql(`
//     query boxes($locationId: String!)
//       {
//         boxes(locationId: $locationId) {
//           id
//           configuration {
//             automationActive
//             appActive
//           }
//           info {
//             ip
//             clientAddress
//           }
//           label
//           zone
//         }
//       }
//   `);
//   const gqlQuery = graphqlClient.query({
//     query,
//     variables: {
//       locationId,
//     },
//   });
//   console.log({ locationId });
//   console.time('query');
//   const { data } = await gqlQuery;
//   console.timeEnd('query');
//   return respond(200, data);
// });

// class DirectvBox {
//   major: number;
//   minor: number;
//   clientAddr: string;
//   locationName: string;
// }

// class DirectvBoxRequest {
//   boxes: DirectvBox[];
//   ip: string;
// }
