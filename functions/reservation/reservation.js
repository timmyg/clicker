const dynamoose = require('dynamoose');
const moment = require('moment');
const { getUserId, getBody, getPathParameters, invokeFunctionSync, respond, track } = require('serverless-helpers');
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
      id: { type: String, required: true },
      ip: { type: String, required: true },
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
  const { cost } = reservation;
  reservation.userId = getUserId(event);

  reservation.end = calculateReservationEndTime(reservation);
  await Reservation.create(reservation);

  // mark box reserved
  await invokeFunctionSync(
    `location-${process.env.stage}-setBoxReserved`,
    { end: reservation.end },
    { id: reservation.location.id, boxId: reservation.box.id },
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
  // const command = 'tune';
  // const { losantId } = reservation.location;
  // const { clientAddress, ip, id: boxId } = reservation.box;
  // const { channel, channelMinor } = reservation.program;
  // const payload = { clientAddress, channel, channelMinor, losantId, ip, command, boxId };
  // await invokeFunctionSync(`remote-${process.env.stage}-command`, payload);
  const command = 'tune';
  await invokeFunctionSync(`remote-${process.env.stage}-command`, { reservation, command });

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
  const { id } = getPathParameters(event);
  let updatedReservation = getBody(event);
  const userId = getUserId(event);
  const originalReservation = await Reservation.get({ id, userId });
  console.log(userId, originalReservation.userId);
  if (userId.replace('sms|', '') !== originalReservation.userId) {
    return respond(403 'invalid userId');
  }
  const updatedCost = originalReservation.cost + updatedReservation.cost;
  const updatedMinutes = originalReservation.minutes + updatedReservation.minutes;
  updatedReservation.end = calculateReservationEndTime(reservation);
  const { program, end } = updatedReservation;
  const reservation = await Reservation.update(
    { id, userId },
    { cost: updatedCost, minutes: updatedMinutes, program, end },
    { returnValues: 'ALL_NEW' },
  );

  // mark box reserved
  await invokeFunctionSync(
    `location-${process.env.stage}-setBoxReserved`,
    { end: updatedReservation.end },
    { id: originalReservation.location.id, boxId: originalReservation.box.id },
    event.headers,
  );

  // deduct from user
  const result = await invokeFunctionSync(
    `user-${process.env.stage}-transaction`,
    { tokens: updatedReservation.cost },
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
  // const command = 'tune';
  // const { losantId } = originalReservation.location;
  // const { clientAddress, ip, id: boxId } = originalReservation.box;
  // const { channel, channelMinor } = updatedReservation.program;
  // const payload = { clientAddress, channel, channelMinor, losantId, ip, command, boxId };
  // console.log('update reservation, change channel');
  // console.log(`remote-${process.env.stage}-command`, payload);
  // await invokeFunctionSync(`remote-${process.env.stage}-command`, payload);
  const command = 'tune';
  await invokeFunctionSync(`remote-${process.env.stage}-command`, { reservation, command });

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

module.exports.activeByUser = async event => {
  const userId = getUserId(event);
  const userReservations = await Reservation.query('userId')
    .eq(userId)
    .exec();
  if (userReservations && userReservations.length) {
    const filtered = userReservations.filter(
      r =>
        r.cancelled != true &&
        r.end >
          moment()
            .subtract(30, 'm')
            .toDate(),
    );
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

  const reservation = await Reservation.get({ id, userId });
  await Reservation.update({ id, userId }, { cancelled: true });

  // mark box free
  await invokeFunctionSync(
    `location-${process.env.stage}-setBoxFree`,
    null,
    { id: reservation.location.id, boxId: reservation.box.id },
    event.headers,
  );

  track({
    userId: userId,
    event: 'Reservation Cancelled',
  });

  return respond(200, `hello`);
};

function calculateReservationEndTime(reservation) {
  reservation.start = moment().toDate();
  const initialEndTimeMoment = reservation.end ? moment(reservation.end) : moment();
  return initialEndTimeMoment.add(reservation.minutes, 'm').toDate();
}
