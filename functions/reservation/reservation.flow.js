// @flow
const dynamoose = require('dynamoose');
const moment = require('moment');
const {
  getUserId,
  getBody,
  getPathParameters,
  respond,
  track,
  Invoke,
  Raven,
  RavenLambdaWrapper,
} = require('serverless-helpers');
const uuid = require('uuid/v1');

declare class process {
  static env: {
    stage: string,
    tableReservation: string,
  };
}

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
      zip: { type: String, required: true },
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

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  let reservation = getBody(event);
  const { cost } = reservation;
  reservation.userId = getUserId(event);

  // ensure location is active
  console.time('ensure location active');
  const { data } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: reservation.location.id })
    .headers(event.headers)
    .go();
  console.timeEnd('ensure location active');
  // console.log(locationResult);
  const locationResultBody = data;
  if (!locationResultBody.active) {
    return respond(400, 'Sorry, location inactive');
  }
  // ensure tv isnt already reserved
  const tv = locationResultBody.boxes.find(b => b.id === reservation.box.id);
  if (!tv || !tv.appActive || (tv.reserved && moment(tv.end).unix() > moment().unix())) {
    console.log(tv);
    return respond(400, 'Sorry, tv is not available for reservation');
  }

  reservation.end = calculateReservationEndTime(reservation);
  await Reservation.create(reservation);

  console.time('mark box reserved');
  // mark box reserved
  await new Invoke()
    .service('location')
    .name('setBoxReserved')
    .body({ end: reservation.end })
    .pathParams({ id: reservation.location.id, boxId: reservation.box.id })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('mark box reserved');

  // deduct from user
  console.time('deduct transaction');
  const result = await new Invoke()
    .service('user')
    .name('transaction')
    .body({ tokens: cost })
    .headers(event.headers)
    .go();
  console.log('result', result);
  const statusCode = result.statusCode;
  console.timeEnd('deduct transaction');
  if (statusCode >= 400) {
    const message: string = result.data.message;
    return respond(statusCode, message);
  }

  console.time('remote command');
  const command = 'tune';
  const source = 'app';
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('remote command');

  // console.time('track event');
  // await track({
  //   userId: reservation.userId,
  //   event: 'Reservation Created',
  //   properties: {
  //     program: reservation.program,
  //     box: reservation.box,
  //     location: reservation.location,
  //     cost: reservation.cost,
  //     minutes: reservation.minutes,
  //   },
  // });
  // console.timeEnd('track event');

  return respond(201, reservation);
});

module.exports.update = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);
  let updatedReservation = getBody(event);
  const userId = getUserId(event);
  const originalReservation = await Reservation.get({ id, userId });
  console.log(userId, originalReservation.userId);
  if (userId.replace('sms|', '') !== originalReservation.userId) {
    return respond(403, 'invalid userId');
  }
  const updatedCost = originalReservation.cost + updatedReservation.cost;
  const updatedMinutes = originalReservation.minutes + updatedReservation.minutes;
  updatedReservation.end = calculateReservationEndTime(updatedReservation);
  const { program, end } = updatedReservation;
  const reservation = await Reservation.update(
    { id, userId },
    { cost: updatedCost, minutes: updatedMinutes, program, end },
    { returnValues: 'ALL_NEW' },
  );

  console.time('mark box reserved');
  // mark box reserved
  await new Invoke()
    .service('location')
    .name('setBoxReserved')
    .body({ end: updatedReservation.end })
    .pathParams({ id: originalReservation.location.id, boxId: originalReservation.box.id })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('mark box reserved');

  // deduct from user
  console.time('deduct transaction');
  const { statusCode, data } = await new Invoke()
    .service('user')
    .name('transaction')
    .body({ tokens: updatedReservation.cost })
    .headers(event.headers)
    .go();
  console.timeEnd('deduct transaction');
  if (statusCode >= 400) {
    // TODO mark not reserved
    const message = data.message;
    return respond(statusCode, message);
  }

  // change the channel
  console.time('remote command');
  const command = 'tune';
  const source = 'app';
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('remote command');

  // console.time('track event');
  // await track({
  //   userId: reservation.userId,
  //   event: 'Reservation Updated',
  //   properties: {
  //     program: reservation.program,
  //     box: reservation.box,
  //     location: reservation.location,
  //     cost: reservation.cost,
  //     minutes: reservation.minutes,
  //   },
  // });
  // console.timeEnd('track event');

  return respond(200, `nice`);
});

module.exports.activeByUser = RavenLambdaWrapper.handler(Raven, async event => {
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
});

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  const params = getPathParameters(event);
  const { id } = params;

  const reservation = await Reservation.get({ id, userId });
  return respond(200, reservation);
});

module.exports.cancel = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  const { id } = getPathParameters(event);

  const reservation = await Reservation.get({ id, userId });
  await Reservation.update({ id, userId }, { cancelled: true });

  // mark box free
  await new Invoke()
    .service('location')
    .name('setBoxFree')
    .pathParams({ id: reservation.location.id, boxId: reservation.box.id })
    .headers(event.headers)
    .async()
    .go();

  // track({
  //   userId: userId,
  //   event: 'Reservation Cancelled',
  //   properties: {
  //     program: reservation.program,
  //     box: reservation.box,
  //     location: reservation.location,
  //     cost: reservation.cost,
  //     minutes: reservation.minutes,
  //   },
  // });

  return respond(200, `hello`);
});

function calculateReservationEndTime(reservation) {
  reservation.start = moment().toDate();
  const initialEndTimeMoment = reservation.end ? moment(reservation.end) : moment();
  return initialEndTimeMoment.add(reservation.minutes, 'm').toDate();
}
