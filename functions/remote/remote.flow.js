// @flow
const losantApi = require('losant-rest');
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

declare class process {
  static env: {
    stage: string,
    losantAccessToken: string,
    losantAppId: string,
  };
}

class LosantApi {
  client: any;
  constructor() {
    this.client = losantApi.createClient({ accessToken: process.env.losantAccessToken });
  }

  async sendCommand(name, losantId, payload) {
    try {
      const params = {
        applicationId: process.env.losantAppId,
        deviceId: losantId,
        deviceCommand: { name, payload },
      };
      return await this.client.device
        .sendCommand(params)
        .then(console.info)
        .catch(console.error);
    } catch (error) {
      return console.error(error);
    }
  }
}

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond();
});

module.exports.command = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    const { command, key, reservation, source } = getBody(event);
    const { losantId, id: locationId } = reservation.location;
    const { ip, clientAddress: client, id: boxId } = reservation.box;
    const { channel, channelMinor } = reservation.program;
    const api = new LosantApi();

    console.log(command, losantId, client, channel, channelMinor, ip, key, source);
    console.time('change channel');
    await api.sendCommand(command, losantId, { client, channel, channelMinor, ip, key });
    console.timeEnd('change channel');

    let eventName, userId;
    if (source === 'app') {
      eventName = 'App Zap';
      userId = reservation.userId;
      const text = `*${eventName}* @ ${reservation.location.name} to ${reservation.program.title}  [${
        reservation.program.channelTitle
      } ${channel}] (${reservation.minutes} mins, TV: ${reservation.box.label}, user: ${userId.substr(
        userId.length - 5,
      )}, previously: ${
        reservation.box.program
          ? `${reservation.box.program.title} _${
              reservation.box.program.clickerRating ? reservation.box.program.clickerRating : 'NR'
            }_`
          : '?'
      } [${reservation.box.program ? reservation.box.program.channelTitle : ''} ${reservation.box.channel}])`;
      await new Invoke()
        .service('notification')
        .name('sendApp')
        .body({ text })
        .async()
        .go();
    } else if (source === 'control center') {
      eventName = 'Control Center Zap';
      userId = 'system';
      const text = `*${eventName}* @ ${reservation.location.name} to ${reservation.program.title} [${
        reservation.program.channelTitle
      } ${channel} *Zone ${reservation.box.zone}*] (previously: ${
        reservation.box.program
          ? `${reservation.box.program.title} _${
              reservation.box.program.clickerRating ? reservation.box.program.clickerRating : 'NR'
            }_`
          : '?'
      } [${reservation.box.program ? reservation.box.program.channelTitle : ''} ${reservation.box.channel}])`;
      await new Invoke()
        .service('notification')
        .name('sendControlCenter')
        .body({ text })
        .async()
        .go();
    } else if (source === 'control center daily') {
      eventName = 'Control Center Daily Zap';
      userId = 'system';
      const text = `*${eventName}* @ ${reservation.location.name} to ${reservation.program.title} [${
        reservation.program.channelTitle
      } ${channel} *Zone ${reservation.box.zone}*] (previously: ${reservation.box.channel}, ${
        reservation.box.program
          ? `${reservation.box.program.title} _${
              reservation.box.program.clickerRating ? reservation.box.program.clickerRating : 'NR'
            }_`
          : '?'
      } [${reservation.box.program ? reservation.box.program.channelTitle : ''} ${channel}])`;
      await new Invoke()
        .service('notification')
        .name('sendControlCenter')
        .body({ text })
        .async()
        .go();
    }

    await new Invoke()
      .service('location')
      .name('updateBoxInfo')
      .body({ channel, source })
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
        location: `${reservation.location.name} (${reservation.location.neighborhood})`,
        zone: reservation.box.zone,
        //  from:,
        to: reservation.program.channel,
        time: new Date(),
        type: eventName,
        boxId: reservation.box.id,
      })
      .async()
      .go();

    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
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
    const { losantId, boxes } = getBody(event);
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
