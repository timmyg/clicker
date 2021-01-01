// @flow
const losantApi = require('losant-rest');
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const moment = require('moment');
const firebase = require('firebase-admin');

declare class process {
  static env: {
    stage: string,
    losantAccessToken: string,
    losantAppId: string,
    firebase: string,
  };
}

const zapTypes = {
  manual: 'manual',
  app: 'app',
  automation: 'automation',
};

class LosantApi {
  client: any;
  constructor() {
    this.client = losantApi.createClient({
      accessToken: process.env.losantAccessToken,
    });
  }

  async sendCommand(name, losantId, payload, losantProductionOverride?: boolean) {
    try {
      console.log({ losantId });
      // only send in non production environment when has losantProductionOverride
      if (process.env.stage === 'prod' || losantProductionOverride) {
        const params = {
          applicationId: process.env.losantAppId,
          deviceId: losantId,
          deviceCommand: { name, payload },
        };
        console.info(`running command via losant (${process.env.stage})`);
        return await this.client.device
          .sendCommand(params)
          .then(console.info)
          .catch(console.error);
      } else {
        console.info(
          `*** not running command via losant (${process.env.stage} environment, no losantProductionOverride)`,
        );
      }
    } catch (error) {
      return console.error(error);
    }
  }
}

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond();
});

module.exports.command = RavenLambdaWrapper.handler(Raven, async event => {
  // try {
  const { command, key, reservation, source, losantProductionOverride, client } = getBody(event);
  const { losantId, id: locationId } = reservation.location;
  const box: Box = reservation.box;
  const { id: boxId, info } = box;
  const { ip, clientAddress } = info;
  const { channel, channelMinor } = reservation.program;
  const api = new LosantApi();

  console.log({ command, losantId, clientAddress, channel, channelMinor, ip, key, source, losantProductionOverride });
  console.time('change channel');

  if (client === 'antenna.pwa') {
    await zapViaFirebase(box.id, locationId, channel, channelMinor, box.info.ip, box.info.clientAddress);
  } else {
    await api.sendCommand(
      command,
      losantId,
      {
        client: clientAddress,
        channel,
        channelMinor,
        ip,
        key,
      },
      losantProductionOverride,
    );
  }

  console.timeEnd('change channel');

  await sendNotification(source, reservation);

  // $FlowFixMe
  let updateBoxInfoBody: BoxInfoRequest = {
    channel,
    channelMinor,
    channelChangeSource: source,
    channelChangeAt: moment().unix() * 1000,
    region: reservation.location.region,
  };

  // set lockedProgrammingId if highly rated automation
  console.log({ reservation });
  const highRatings = [10, 9, 8, 7];
  const isHighlyRated =
    reservation.program && reservation.program.clickerRating && highRatings.includes(reservation.program.clickerRating);
  if (source === zapTypes.automation && isHighlyRated) {
    updateBoxInfoBody.lockedProgrammingIds = [reservation.program.programmingId];
    // updateBoxInfoBody.removeLockedUntil = true;
    // updateBoxInfoBody.program = reservation.program;
  }

  console.log({ updateBoxInfoBody });

  await new Invoke()
    .service('box')
    .name('updateLive')
    .body(updateBoxInfoBody)
    .pathParams({ locationId: reservation.location.id, boxId: reservation.box.id })
    .async()
    .go();

  const name = source;
  const data = {
    boxLabel: reservation.box.label,
    boxZone: reservation.box.zone,
    channelMinor: reservation.program.channelMinor,
    channelTitle: reservation.program.channelTitle,
    cost: reservation.cost,
    channel: reservation.program.channel,
    programTitle: reservation.program.title,
    programCategory: reservation.program.mainCategory,
    programDescription: reservation.program.description,
    minutes: reservation.minutes,
    // points: reservation.points,
    locationId: reservation.location.id,
    locationName: reservation.location.name,
    locationNeighborhood: reservation.location.neighborhood,
  };

  console.time('track event');
  await new Invoke()
    .service('analytics')
    .name('track')
    .body({ userId: reservation.userId, name, data })
    .async()
    .go();
  console.timeEnd('track event');

  console.log('to', reservation.program.channel);
  await new Invoke()
    .service('admin')
    .name('logChannelChange')
    .body({
      location: reservation.location,
      box: reservation.box,
      program: reservation.program,
      time: new Date(),
      type: name,
    })
    .async()
    .go();

  return respond();
});

async function zapViaFirebase(
  boxId: string,
  locationId: string,
  channel: number,
  channelMinor: number,
  ip: string,
  clientAddress: string,
) {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      credential: firebase.credential.cert(JSON.parse(process.env.firebase)),
      databaseURL: 'https://clicker-1577130258869.firebaseio.com',
    });
  }
  const db = firebase.database();
  const refName = `zaps-${process.env.stage}`;
  const zapsRef = db.ref(refName);
  let payload: Object = { boxId, locationId, channel, timestamp: Date.now(), ip, clientAddress };
  if (!!channelMinor) {
    payload.channelMinor = channelMinor;
  }
  const result = await zapsRef.push(payload);
  console.log({ result });
}

function getCurrentProgramText(eventName, location, program) {
  return `*${eventName}* @ ${location.name} to ${program.title} {${program.clickerRating ||
    'NR'}}  [${program.channelTitle || ''} ${program.channel || ''}]`;
}

async function sendNotification(source: string, reservation: Reservation) {
  console.log({ source, reservation });
  let eventName, userId;
  const { program } = reservation;
  // const { channel } = program;
  const previousProgram = reservation.box && reservation.box.live && reservation.box.live.program;
  const previousProgramText = previousProgram
    ? ` ~${previousProgram.title || ''} {${previousProgram.clickerRating || 'NR'}} [${previousProgram.channelTitle ||
        ''} ${previousProgram.channel || ''}]~`
    : '';

  if (source === zapTypes.app) {
    eventName = 'App Zap';
    if (reservation.isManager) {
      eventName += ' (Manager)';
    }
    if (reservation.isVip) {
      eventName += ' (VIP)';
    }
    const isUpdate = moment(reservation.updatedAt).diff(reservation.createdAt) > 500;
    if (isUpdate) {
      eventName += ' (Update)';
    }
    userId = reservation.userId;
    const userResult = await new Invoke()
      .service('user')
      .name('get')
      .pathParams({ id: userId })
      .go();
    console.log({ userResult });
    const userLifetimeZaps = userResult && userResult.data ? userResult.data.lifetimeZaps : '';

    const text =
      getCurrentProgramText(eventName, reservation.location, program) +
      ` [${reservation.minutes} mins, TV: ${reservation.box.label}, user: ${userId.substr(
        userId.length - 5,
      )}, ${userLifetimeZaps} zaps]` +
      previousProgramText;
    await new Invoke()
      .service('notification')
      .name('sendApp')
      .body({ text })
      .async()
      .go();
  } else if (source === zapTypes.automation) {
    eventName = 'Control Center Zap';
    const text =
      getCurrentProgramText(eventName, reservation.location, program) +
      ` Zone ${reservation.box.zone} ` +
      previousProgramText;
    await new Invoke()
      .service('notification')
      .name('sendControlCenter')
      .body({ text })
      .async()
      .go();
  }
}

module.exports.syncWidgetBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const { losantId, losantProductionOverride } = getBody(event);
    const api = new LosantApi();

    const command = 'sync.boxes';
    await api.sendCommand(command, losantId, {}, losantProductionOverride);
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not syncWidgetBoxes: ${e.stack}`);
  }
});

module.exports.checkBoxesInfo = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const body: CheckBoxesInfoRequest = getBody(event);
    const { losantId, boxes, losantProductionOverride } = body;
    console.log({ losantId, boxes });
    const api = new LosantApi();
    const payload = { boxes };

    const command = 'info.current.all';
    console.log({ command, losantId, payload, losantProductionOverride });
    await api.sendCommand(command, losantId, payload, losantProductionOverride);
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not checkBoxesInfo: ${e.stack}`);
  }
});

module.exports.debug = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const { command, payload, losantId } = getBody(event);
    const api = new LosantApi();

    await api.sendCommand(command, losantId, payload, true);
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
});
