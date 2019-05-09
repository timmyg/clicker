const dynamoose = require('dynamoose');
const moment = require('moment');
const {
  getUserId,
  getBody,
  getPathParameters,
  invokeFunction,
  invokeFunctionSync,
  respond,
  track,
} = require('serverless-helpers');
const uuid = require('uuid/v1');

const Reservation = dynamoose.model(
  process.env.tableReservation,
  {
    userId: {
      type: String,
      hashKey: true,
      required: true,
      set: val => {
        return decodeURI(val).replace('sms|', '');
      },
    },
    id: {
      type: String,
      rangeKey: true,
      default: uuid,
    },
    locationId: String,
    location: {
      id: { type: String, required: true },
      losantId: { type: String, required: true },
      name: { type: String, required: true },
      neighborhood: { type: String, required: true },
      zip: { type: Number, required: true },
      ip: { type: String, required: true },
      img: { type: String, required: true },
    },
    box: {
      id: { type: String, required: true },
      clientAddress: { type: String, required: true },
      locationName: { type: String, required: true },
      label: { type: String, required: true },
    },
    program: {
      id: { type: String, required: true },
      channel: { type: Number, required: true },
      channelMinor: { type: Number },
      channelTitle: { type: String, required: true },
      title: { type: String, required: true },
    },
    cost: { type: Number, required: true },
    minutes: { type: Number, required: true },
    start: Date,
    end: Date,
    cancelled: Boolean,
    // start: {
    //   type: Date,
    //   required: true
    //   index: {
    //     global: true,
    //     rangeKey: 'location.id',
    //     name: 'StartTimeByLocationIndex',
    //     project: true, // ProjectionType: ALL
    //     throughput: process.env.tableThroughputs
    //   }
    // },
    // end: {
    //   type: Date,
    //   required: true
    //   index: {
    //     global: true,
    //     rangeKey: 'location.id',
    //     name: 'EndTimeByLocationIndex',
    //     project: true, // ProjectionType: ALL
    //     throughput: process.env.tableThroughputs
    //   }
    // },
    // cancelled: {
    //   type:Boolean,
    //   index: {
    //     global: true,
    //     rangeKey: 'location.id',
    //     name: 'CancelledByLocationIndex',
    //     project: true, // ProjectionType: ALL
    //     throughput: process.env.tableThroughputs
    //   }
    // },
  },
  {
    timestamps: true,
  },
);

// ServiceSchema.method('getBaseFeature', async function () {
//   var {Feature} = require("./index");
//   var feature = await Feature.query("serviceId").eq(this.id).filter({type: "base"}).exec();
//   if (feature.length != 0)
//   {
//     return feature[0];
//   }
//   return false;
// });

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.create = async event => {
  let reservation = getBody(event);
  reservation.locationId = reservation.location.id;
  const { cost } = reservation;
  reservation.userId = getUserId(event);

  reservation = calculateReservationTimes(reservation);
  await Reservation.create(reservation);

  // mark box reserved
  await invokeFunction(
    `location-${process.env.stage}-setBoxReserved`,
    { end: reservation.end },
    { id: reservation.locationId, boxId: reservation.box.id },
    event.headers,
  );

  // deduct from user
  const result = await invokeFunctionSync(
    `user-${process.env.stage}-transaction`,
    { tokens: cost },
    null,
    event.headers,
  );
  const statusCode = JSON.parse(result.Payload).statusCode;
  if (statusCode >= 400) {
    const message = JSON.parse(JSON.parse(result.Payload).body).message;
    return respond(statusCode, message);
  }

  // change the channel
  const command = 'tune';
  const { losantId } = reservation.location;
  const { clientAddress: client, ip, id: boxId } = reservation.box;
  const { channel, channelMinor } = reservation.program;
  const payload = { client, channel, channelMinor, losantId, ip, command, boxId };
  await invokeFunction(`remote-${process.env.stage}-command`, payload);

  await track({
    userId: reservation.userId,
    event: 'Reservation Created',
    properties: {
      program: reservation.program,
      box: reservation.box,
      location: reservation.location,
      cost: reservation.cost,
      minutes: reservation.minutes,
    },
  });
  return respond(201, reservation);
};

module.exports.update = async event => {
  let reservation = getBody(event);
  const userId = getUserId(event);
  reservation.userId = userId;
  const { id } = getPathParameters(event);
  const cost = reservation.cost;

  // "errorMessage": "Invalid UpdateExpression: Two document paths overlap with each other; must remove or rewrite one
  // of these paths; path one: [createdAt], path two: [cost]"
  delete reservation.cost;
  delete reservation.createdAt;
  reservation = calculateReservationTimes(reservation);
  await Reservation.update({ id, userId }, reservation);

  // mark box reserved
  await invokeFunction(
    `location-${process.env.stage}-setBoxReserved`,
    { end: reservation.end },
    { id: reservation.locationId, boxId: reservation.box.id },
    event.headers,
  );

  // deduct from user
  const result = await invokeFunctionSync(
    `user-${process.env.stage}-transaction`,
    { tokens: cost },
    null,
    event.headers,
  );
  const statusCode = JSON.parse(result.Payload).statusCode;
  if (statusCode >= 400) {
    // TODO mark not reserved
    const message = JSON.parse(JSON.parse(result.Payload).body).message;
    return respond(statusCode, message);
  }

  // change the channel
  const command = 'tune';
  const { losantId } = reservation.location;
  const { clientAddress: client, ip, id: boxId } = reservation.box;
  const { channel, channelMinor } = reservation.program;
  const payload = { client, channel, channelMinor, losantId, ip, command, boxId };
  console.log('update reservation, change channel');
  console.log(`remote-${process.env.stage}-command`, payload);
  await invokeFunction(`remote-${process.env.stage}-command`, payload);

  await track({
    userId: reservation.userId,
    event: 'Reservation Updated',
    properties: {
      program: reservation.program,
      box: reservation.box,
      location: reservation.location,
      cost: reservation.cost,
      minutes: reservation.minutes,
    },
  });

  return respond(200, `hello`);
};

module.exports.all = async event => {
  const userId = getUserId(event);
  const userReservations = await Reservation.query('userId')
    .eq(userId)
    .exec();
  const filtered = userReservations.filter(r => r.cancelled != true);
  const sorted = filtered.sort((a, b) => (a.end > b.end ? 1 : -1));
  return respond(200, sorted);
};

module.exports.activeByUser = async event => {
  const userId = getUserId(event);
  const userReservations = await Reservation.query('userId')
    .eq(userId)
    .exec();
  if (userReservations && userReservations.length) {
    const filtered = userReservations.filter(r => r.cancelled != true && r.end > new Date());
    const sorted = filtered.sort((a, b) => (a.end < b.end ? 1 : -1));
    return respond(200, sorted);
  }
  return respond(200, []);
};

module.exports.get = async event => {
  const userId = getUserId(event);
  const params = getPathParameters(event);
  const { id } = params;

  const reservation = await Reservation.get({ id, userId });
  return respond(200, reservation);
};

module.exports.cancel = async event => {
  const userId = getUserId(event);
  const { id } = getPathParameters(event);

  await Reservation.update({ id, userId }, { cancelled: true });

  // mark box free
  await invokeFunction(
    `location-${process.env.stage}-setBoxFree`,
    null,
    { id: reservation.locationId, boxId: reservation.box.id },
    event.headers,
  );

  track({
    userId: userId,
    event: 'Reservation Cancelled',
  });

  return respond(200, `hello`);
};

function calculateReservationTimes(reservation) {
  reservation.start = moment().toDate();
  const initialEndTimeMoment = reservation.end ? moment(reservation.end) : moment();
  reservation.end = initialEndTimeMoment.add(reservation.minutes, 'm').toDate();
  return reservation;
}
