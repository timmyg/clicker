const dynamoose = require('dynamoose');
const { getAuthBearerToken, getBody, getPathParameters, invokeFunction, respond } = require('serverless-helpers');
const uuid = require('uuid/v1');

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
  const body = getBody(event);
  body.userId = getAuthBearerToken(event);
  const reservation = await Reservation.create(body);

  // TODO - this should change channel - need to test
  const { losantId } = body.location;
  const { clientAddress: client } = body.tv;
  const { channel } = body.program;
  const payload = { client, channel };
  invokeFunction(`remote-${process.env.stage}-tune`, { losantId, payload });

  return respond(201, reservation);
};

module.exports.all = async event => {
  const userId = getAuthBearerToken(event);
  const userReservations = await Reservation.query('userId')
    .eq(userId)
    .exec();
  const filtered = userReservations.filter(r => r.cancelled != true);
  return respond(200, filtered);
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

module.exports.changeChannel = async event => {
  // TODO ensure user owns tv
  const userId = getAuthBearerToken(event);
  const program = getBody(event);
  const params = getPathParameters(event);
  const { id } = params;

  await Reservation.update({ id, userId }, { program });
  // TODO change channel
  return respond(200, `hello`);
};

module.exports.changeTime = async event => {
  // TODO ensure user has enough tokens
  const userId = getAuthBearerToken(event);
  const body = getBody(event);
  const { end } = body;
  const params = getPathParameters(event);
  const { id } = params;

  await Reservation.update({ id, userId }, { end });
  // TODO change channel
  return respond(200, `hello`);
};
