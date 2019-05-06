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
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    cancelled: Boolean,
  },
  {
    timestamps: true,
  },
);

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.create = async event => {
  let reservation = getBody(event);
  const { cost } = reservation;
  reservation.userId = getUserId(event);

  reservation = calculateReservationTimes(reservation);
  await Reservation.create(reservation);

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
  const { clientAddress: client, ip } = reservation.box;
  const { channel, channelMinor } = reservation.program;
  const payload = { client, channel, channelMinor, losantId, ip, command };
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
  const { clientAddress: client, ip } = reservation.box;
  const { channel, channelMinor } = reservation.program;
  const payload = { client, channel, channelMinor, losantId, ip, command };
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

module.exports.active = async event => {
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
