// @flow
const losantApi = require('losant-rest');
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const moment = require('moment');

declare class process {
  static env: {
    stage: string,
    losantAccessToken: string,
    losantAppId: string,
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

  async sendCommand(name, losantId, payload) {
    try {
      // TODO: for non-production environment, maybe lets have an override param
      //  that is set on the location?
      if (process.env.stage === 'prod') {
        const params = {
          applicationId: process.env.losantAppId,
          deviceId: losantId,
          deviceCommand: { name, payload },
        };
        return await this.client.device
          .sendCommand(params)
          .then(console.info)
          .catch(console.error);
      } else {
        console.info(`not changing channel via losant (${process.env.stage})`);
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
  const { command, key, reservation, source } = getBody(event);
  const { losantId, id: locationId } = reservation.location;
  const { ip, clientAddress: client, id: boxId } = reservation.box;
  const { channel, channelMinor } = reservation.program;
  const api = new LosantApi();

  console.log({ command, losantId, client, channel, channelMinor, ip, key, source });
  console.time('change channel');

  await api.sendCommand(command, losantId, {
    client,
    channel,
    channelMinor,
    ip,
    key,
  });

  console.timeEnd('change channel');

  // slack garbage
  let eventName, userId;
  if (source === zapTypes.app) {
    eventName = 'App Zap';
    userId = reservation.userId;
    const text = `*${eventName}* @ ${reservation.location.name} to ${reservation.program.title}  [${
      reservation.program.channelTitle
    } ${channel}] (${reservation.minutes} mins, TV: ${reservation.box.label}, user: ${userId.substr(
      userId.length - 5,
    )}\n\t_previously ${
      reservation.box.program
        ? `${reservation.box.program.title} {${
            reservation.box.program.clickerRating ? reservation.box.program.clickerRating : 'NR'
          }}`
        : '?'
    } [${reservation.box.program ? reservation.box.program.channelTitle : ''} ${reservation.box.channel}]_`;
    await new Invoke()
      .service('notification')
      .name('sendApp')
      .body({ text })
      .async()
      .go();
  } else if (source === zapTypes.automation) {
    eventName = 'Control Center Zap';
    userId = 'system';
    let text = `*${eventName}* @ ${reservation.location.name} to ${reservation.program.title} {${
      reservation.program.clickerRating
    }} [${reservation.program.channelTitle} ${channel} *Zone ${reservation.box.zone}*]\n\t_previously ${
      reservation.box.program
        ? `${reservation.box.program.title} {${
            reservation.box.program.clickerRating ? reservation.box.program.clickerRating : 'NR'
          }}`
        : '?'
    } [${reservation.box.program ? reservation.box.program.channelTitle : ''} ${reservation.box.channel}]_`;
    // ccv1
    if (!reservation.program.clickerRating) {
      text = `*${eventName}* @ ${reservation.location.name} to ${channel} on *Zone ${reservation.box.zone}*`;
      text += `\n\t_previously ${
        reservation.box.program
          ? `${reservation.box.program.title} {${
              reservation.box.program.clickerRating ? reservation.box.program.clickerRating : 'NR'
            }}`
          : '?'
      } [${reservation.box.program ? reservation.box.program.channelTitle : ''} ${reservation.box.channel}]_`;
    }
    await new Invoke()
      .service('notification')
      .name('sendControlCenter')
      .body({ text })
      .async()
      .go();
  }

  // $FlowFixMe
  let updateBoxInfoBody: BoxInfoRequest = {
    channel,
    source,
    channelChangeAt: moment().unix() * 1000,
  };

  // set lockedPorgrammingId if highly rated automation
  console.log({ reservation });
  const highRatings = [10, 9, 8, 7];
  const isHighlyRated =
    reservation.program && reservation.program.clickerRating && highRatings.includes(reservation.program.clickerRating);
  if (source === zapTypes.automation && isHighlyRated) {
    updateBoxInfoBody.lockedProgrammingId = reservation.program.programmingId;
    updateBoxInfoBody.removeLockedUntil = true;
    updateBoxInfoBody.program = reservation.program;
  }

  console.log({ updateBoxInfoBody });

  await new Invoke()
    .service('location')
    .name('updateBoxInfo')
    .body(updateBoxInfoBody)
    .pathParams({ id: reservation.location.id, boxId: reservation.box.id })
    .async()
    .go();

  const name = eventName;
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
    .body({ userId, name, data })
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

module.exports.syncWidgetBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const { losantId } = getBody(event);
    const api = new LosantApi();

    const command = 'sync.boxes';
    await api.sendCommand(command, losantId, {});
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not syncWidgetBoxes: ${e.stack}`);
  }
});

module.exports.checkBoxesInfo = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const body: CheckBoxesInfoRequest = getBody(event);
    const { losantId, boxes } = body;
    console.log({ losantId, boxes });
    const api = new LosantApi();
    const payload = { boxes };

    const command = 'info.current.all';
    await api.sendCommand(command, losantId, payload);
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

    await api.sendCommand(command, losantId, payload);
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
});
