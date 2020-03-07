// @flow
const dynamoose = require('dynamoose');
const moment = require('moment');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
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
const firebase = require('firebase-admin');
const zapTypes = {
  manual: 'manual',
  app: 'app',
  automation: 'automation',
};

declare class process {
  static env: {
    firebase: string,
    stage: string,
    tableReservation: string,
    NODE_ENV: string,
  };
}

if (process.env.NODE_ENV === 'test') {
  dynamoose.AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'test',
  });
}
const dbReservation = dynamoose.model(
  process.env.tableReservation,
  {
    userId: {
      type: String,
      hashKey: true,
      required: true,
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
      // zip: { type: String, required: true },
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
    start: Number,
    end: Number,
    cancelled: Boolean,
  },
  {
    timestamps: true,
    expires: {
      ttl: 86400,
      attribute: 'expires',
      returnExpiredItems: false,
      defaultExpires: x => {
        // TODO x is undefined during reservation update and
        //  blows everything up
        console.log({ x });
        console.log(this);
        // expire 60 minutes after end
        if (x) {
          return moment(x.end)
            .add(60, 'minutes')
            .toDate();
        } else {
          return moment()
            .add(300, 'minutes')
            .toDate();
        }
      },
    },
  },
);

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

async function demoZapViaFirebase(boxId: string, channel: number) {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      credential: firebase.credential.cert(JSON.parse(process.env.firebase)),
      databaseURL: 'https://clicker-1577130258869.firebaseio.com',
    });
  }
  const db = firebase.database();
  const refName = `zaps-${process.env.stage}`;
  const zapsRef = db.ref(refName);
  const result = await zapsRef.push({ boxId, channel, timestamp: Date.now() });
  console.log({ result });
}

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  let reservation: Reservation = getBody(event);
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

  console.log(reservation.location.demo, reservation.box.id, reservation.program.channel);
  if (reservation.location.demo) {
    // demo location, send zap via firestore
    await demoZapViaFirebase(reservation.box.id, reservation.program.channel);
    await new Invoke()
      .service('notification')
      .name('sendControlCenter')
      .body({ text: 'Demo Zap' })
      .async()
      .go();
    return respond(200);
  }

  // console.log(locationResult);
  const locationResultBody = data;
  if (!locationResultBody.active) {
    return respond(400, 'Sorry, location inactive');
  }
  // ensure tv isnt already reserved
  let tv: Box = locationResultBody.boxes.find(b => b.id === reservation.box.id);

  if (!tv || !tv.configuration || !tv.configuration.appActive || tv.live.locked) {
    console.log(tv);
    return respond(400, 'Sorry, tv is not available for reservation');
  }

  reservation.end = calculateReservationEndTime(reservation);
  await dbReservation.create(reservation);

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
    .body({ tokens: cost, minutes: reservation.minutes })
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
  const source = zapTypes.app;
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('remote command');

  console.time('audit');
  await new Invoke()
    .service('audit')
    .name('create')
    .body({
      type: 'reservation:create',
      entity: reservation,
    })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('audit');

  return respond(201, reservation);
});

module.exports.update = RavenLambdaWrapper.handler(Raven, async event => {
  const { id } = getPathParameters(event);
  let updatedReservation = getBody(event);
  const userId = getUserId(event);
  console.log(id, userId);
  const originalReservation: Reservation = await dbReservation.get({
    id,
    userId,
  });
  console.log({ originalReservation });
  console.log({ updatedReservation });
  console.log(userId, originalReservation.userId);
  if (userId !== originalReservation.userId) {
    return respond(403, 'invalid userId');
  }
  const updatedCost = originalReservation.cost + updatedReservation.cost;
  const updatedMinutes = originalReservation.minutes + updatedReservation.minutes;
  updatedReservation.end = calculateReservationEndTime(updatedReservation);
  const { program, end } = updatedReservation;
  console.log('update reservation:');
  console.log({ cost: updatedCost, minutes: updatedMinutes, program, end });
  const reservation: Reservation = await dbReservation.update(
    { id, userId },
    { cost: updatedCost, minutes: updatedMinutes, program, end },
    { returnValues: 'ALL_NEW', updateExpires: true },
  );

  console.time('mark box reserved');
  // mark box reserved
  await new Invoke()
    .service('location')
    .name('setBoxReserved')
    .body({ end: updatedReservation.end })
    .pathParams({
      id: originalReservation.location.id,
      boxId: originalReservation.box.id,
    })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('mark box reserved');

  // deduct from user
  console.time('deduct transaction');
  const { statusCode, data } = await new Invoke()
    .service('user')
    .name('transaction')
    .body({ tokens: updatedReservation.cost, minutes: updatedReservation.minutes })
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
  const source = zapTypes.app;
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source })
    .headers(event.headers)
    .async()
    .go();
  console.timeEnd('remote command');

  await new Invoke()
    .service('audit')
    .name('create')
    .body({
      type: 'reservation:update',
      reservation,
    });

  return respond(200, `nice`);
});

module.exports.activeByUser = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  const userReservations: Reservation[] = await dbReservation
    .query('userId')
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

  const reservation: Reservation = await dbReservation.get({ id, userId });
  return respond(200, reservation);
});

module.exports.cancel = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  const { id } = getPathParameters(event);

  const reservation: Reservation = await dbReservation.get({ id, userId });
  await dbReservation.update({ id, userId }, { cancelled: true }, { updateExpires: true });

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

function calculateReservationEndTime(reservation): number {
  reservation.start = moment().unix() * 1000;
  const initialEndTimeMoment = reservation.end ? moment(reservation.end) : moment();
  return initialEndTimeMoment.add(reservation.minutes, 'm').unix() * 1000;
}
