const dynamoose = require('dynamoose');
const { getAuthBearerToken, getBody, getPathParameters, invokeFunction, respond } = require('serverless-helpers');
const uuid = require('uuid/v1');
const moment = require('moment');

const Reservation = dynamoose.model(
  process.env.tableReservation,
  {
    userId: { type: String, hashKey: true, required: true },
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
  reservation.userId = getAuthBearerToken(event);

  reservation = calculateReservationTimes(reservation);
  await Reservation.create(reservation);

  // TODO - this should change channel - need to test
  const { losantId } = reservation.location;
  const { clientAddress: client } = reservation.box;
  const { channel } = reservation.program;
  const payload = { client, channel };
  console.log('new reservation, change channel');
  console.log(`remote-${process.env.stage}-tune`, { losantId, payload });
  await invokeFunction(`remote-${process.env.stage}-tune`, { losantId, payload });

  return respond(201, reservation);
};

module.exports.all = async event => {
  const userId = getAuthBearerToken(event);
  const userReservations = await Reservation.query('userId')
    .eq(userId)
    .exec();
  const filtered = userReservations.filter(r => r.cancelled != true);
  const sorted = filtered.sort((a, b) => (a.end > b.end ? 1 : -1));
  return respond(200, sorted);
};

module.exports.active = async event => {
  const userId = getAuthBearerToken(event);
  const userReservations = await Reservation.query('userId')
    .eq(userId)
    .exec();
  const filtered = userReservations.filter(r => r.cancelled != true && r.end > new Date());
  const sorted = filtered.sort((a, b) => (a.end < b.end ? 1 : -1));
  return respond(200, sorted);
};

module.exports.get = async event => {
  const userId = getAuthBearerToken(event);
  const params = getPathParameters(event);
  const { id } = params;

  const reservation = await Reservation.get({ id, userId });
  return respond(200, reservation);
};

module.exports.cancel = async event => {
  const userId = getAuthBearerToken(event);
  const params = getPathParameters(event);
  const { id } = params;

  await Reservation.update({ id, userId }, { cancelled: true });
  return respond(200, `hello`);
};

module.exports.update = async event => {
  console.log('resrvation update', event);
  // TODO ensure user owns tv
  const userId = getAuthBearerToken(event);
  let reservation = getBody(event);
  const params = getPathParameters(event);
  const { id } = params;

  // "errorMessage": "Invalid UpdateExpression: Two document paths overlap with each other; must remove or rewrite one
  // of these paths; path one: [createdAt], path two: [cost]"
  delete reservation.cost;
  delete reservation.createdAt;
  reservation = calculateReservationTimes(reservation);
  await Reservation.update({ id, userId }, reservation);

  // TODO - this should change channel - need to test
  const { losantId } = reservation.location;
  const { clientAddress: client } = reservation.box;
  const { channel } = reservation.program;
  const payload = { client, channel };
  console.log('update reservation, change channel');
  console.log(`remote-${process.env.stage}-tune`, { losantId, payload });
  invokeFunction(`remote-${process.env.stage}-tune`, { losantId, payload });

  return respond(200, `hello`);
};

function calculateReservationTimes(reservation) {
  reservation.start = moment().toDate();
  const initialEndTimeMoment = reservation.end ? moment(reservation.end) : moment();
  reservation.end = initialEndTimeMoment.add(reservation.minutes, 'm').toDate();
  return reservation;
}
