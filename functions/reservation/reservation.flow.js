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
      free: Boolean,
    },
    box: {
      id: { type: String, required: true },
      label: { type: String, required: true },
      zone: { type: String, required: true },
      info: {
        clientAddress: String, // dtv calls this clientAddr
        locationName: String, // dtv name
        ip: String,
        notes: String,
      },
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
    isManager: { type: Boolean, default: false },
    isVip: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    expires: {
      ttl: 86400,
      attribute: 'expires',
      returnExpiredItems: false,
      defaultExpires: (x) => {
        // TODO x is undefined during reservation update and
        //  blows everything up
        console.log({ x });
        console.log(this);
        // expire 60 minutes after end
        if (x) {
          return moment(x.end).add(60, 'minutes').toDate();
        } else {
          return moment().add(300, 'minutes').toDate();
        }
      },
    },
  },
);

module.exports.health = RavenLambdaWrapper.handler(Raven, async (event) => {
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
  const refName = `zaps-demo-${process.env.stage}`;
  const zapsRef = db.ref(refName);
  const result = await zapsRef.push({ boxId, channel, timestamp: Date.now() });
  console.log({ result });
}

module.exports.create = RavenLambdaWrapper.handler(Raven, async (event) => {
  let reservation: Reservation = getBody(event);
  console.log({ reservation });
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
  let tv: Box = locationResultBody.boxes.find((b) => b.id === reservation.box.id);

  if (!tv || !tv.configuration || !tv.configuration.appActive || tv.live.locked) {
    console.log(tv);
    if (!reservation.isManager) {
      return respond(400, 'Sorry, tv is not available for reservation');
    }
  }

  reservation.end = calculateReservationEndTime(reservation);
  console.log({ reservation });
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
  const { losantProductionOverride, client } = reservation.location;
  await new Invoke()
    .service('remote')
    .name('command')
    .body({ reservation, command, source, losantProductionOverride, client })
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

module.exports.update = RavenLambdaWrapper.handler(Raven, async (event) => {
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
  const updatedCost = originalReservation.cost + (updatedReservation.update.cost || 0);
  const updatedMinutes = originalReservation.minutes + (updatedReservation.update.minutes || 0);
  updatedReservation.end = calculateReservationEndTime(updatedReservation);
  console.log('update reservation:');
  let updatedFields: any = { cost: updatedCost, minutes: updatedMinutes, end: updatedReservation.end };
  const { program } = updatedReservation.update;
  if (program) {
    updatedFields.program = program;
  }
  console.log({ cost: updatedCost, minutes: updatedMinutes, program, end: updatedReservation.end });
  const reservation: Reservation = await dbReservation.update({ id, userId }, updatedFields, {
    returnValues: 'ALL_NEW',
    updateExpires: true,
  });

  // deduct from user
  console.time('deduct transaction');
  const { statusCode, data } = await new Invoke()
    .service('user')
    .name('transaction')
    .body({ tokens: updatedReservation.update.cost || 0, minutes: updatedReservation.update.minutes || 0 })
    .headers(event.headers)
    .go();
  console.timeEnd('deduct transaction');
  if (statusCode >= 400) {
    // TODO mark not reserved
    const message = data.message;
    return respond(statusCode, message);
  }

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

  console.time('ensure location active');
  const { data: locationBody } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: reservation.location.id })
    .headers(event.headers)
    .go();
  console.timeEnd('ensure location active');
  const location: Venue = locationBody;
  if (!location.active) {
    return respond(400, 'Sorry, location inactive');
  }

  // change the channel if updating program
  if (updatedReservation.update.program) {
    console.time('remote command');
    const command = 'tune';
    const source = zapTypes.app;
    await new Invoke()
      .service('remote')
      .name('command')
      .body({
        reservation,
        command,
        source,
        losantProductionOverride: location.losantProductionOverride,
      })
      .headers(event.headers)
      .async()
      .go();
    console.timeEnd('remote command');
  } else if (updatedReservation.update.minutes) {
    const { userId } = updatedReservation;
    // updating time
    await new Invoke()
      .service('notification')
      .name('sendApp')
      .body({
        text: `Extend timeframe [${updatedReservation.update.minutes} mins, user: ${userId.substr(
          userId.length - 5,
        )}, ${originalReservation.program.channelTitle} ${originalReservation.program.title} ]`,
      })
      .async()
      .go();
  }

  await new Invoke().service('audit').name('create').body({
    type: 'reservation:update',
    reservation,
  });

  return respond(200, `nice`);
});

module.exports.activeByUser = RavenLambdaWrapper.handler(Raven, async (event) => {
  const userId = getUserId(event);
  const userReservations: Reservation[] = await dbReservation.query('userId').eq(userId).exec();
  if (userReservations && userReservations.length) {
    const filtered = userReservations.filter(
      (r) => r.cancelled != true && r.updatedAt > moment().subtract(45, 'm').toDate(),
    );
    const sorted = filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return respond(200, sorted);
  }
  return respond(200, []);
});

module.exports.get = RavenLambdaWrapper.handler(Raven, async (event) => {
  const userId = getUserId(event);
  const params = getPathParameters(event);
  const { id } = params;

  const reservation: Reservation = await dbReservation.get({ id, userId });
  return respond(200, reservation);
});

module.exports.cancel = RavenLambdaWrapper.handler(Raven, async (event) => {
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
  if (reservation.update && reservation.update.minutes) {
    // updating reservation
    return moment(reservation.end).add(reservation.update.minutes, 'm').unix() * 1000;
  } else if (reservation.update && reservation.update.program) {
    // keep same time
    return reservation.end;
  } else {
    // new reservation
    return moment().add(reservation.minutes, 'm').unix() * 1000;
  }
  // const initialEndTimeMoment = reservation.end ? moment(reservation.end) : moment();
  // return initialEndTimeMoment.add(reservation.minutes, 'm').unix() * 1000;
}
