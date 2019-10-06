// @flow
const losantApi = require('losant-rest');
const { respond, getBody, Invoke } = require('serverless-helpers');
const { IncomingWebhook } = require('@slack/webhook');

declare class process {
  static env: {
    stage: string,
    losantAccessToken: string,
    losantAppId: string,
    slackControlCenterWebhookUrl: string,
    slackAppWebhookUrl: string,
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

module.exports.health = async (event: any) => {
  return respond();
};

module.exports.command = async (event: any) => {
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

    console.time('update channel');
    const invoke = new Invoke();
    await invoke
      .service('location')
      .name('updateChannel')
      .body({ channel, source })
      .pathParams({ id: locationId, boxId })
      .async()
      .go();
    console.timeEnd('update channel');

    const appWebhook = new IncomingWebhook(process.env.slackAppWebhookUrl);
    const controlCenterWebhook = new IncomingWebhook(process.env.slackControlCenterWebhookUrl);
    let eventName, userId;
    if (source === 'app') {
      eventName = 'App Zap';
      userId = reservation.userId;
      const title = `${eventName} @ ${reservation.location.name} ${
        process.env.stage !== 'prod' ? process.env.stage : ''
      }`;
      const text = `Zapped to ${reservation.program.title} on ${reservation.program.channelTitle}`;
      const color = '#0091ea'; // good, warning, danger
      await appWebhook.send({
        attachments: [
          {
            title,
            fallback: title,
            color,
            text,
            fields: [
              {
                title: 'Minutes',
                value: reservation.minutes,
                short: true,
              },
              {
                title: 'TV Label',
                value: reservation.box.label,
                short: true,
              },
            ],
          },
        ],
      });
    } else if (source === 'control center') {
      eventName = 'Control Center Zap';
      userId = 'system';
      const title = `${eventName} @ ${reservation.location.name} ${
        process.env.stage !== 'prod' ? process.env.stage : ''
      }`;
      const color = '#0091ea'; // good, warning, danger
      await controlCenterWebhook.send({
        attachments: [
          {
            title,
            fallback: title,
            color,
            fields: [
              {
                title: 'Channel',
                value: channel,
                short: true,
              },
              {
                title: 'Zone',
                value: reservation.box.zone,
                short: true,
              },
            ],
          },
        ],
      });
    } else if (source === 'control center daily') {
      eventName = 'Control Center Daily Zap';
      userId = 'system';
      const title = `${eventName} @ ${reservation.location.name} ${
        process.env.stage !== 'prod' ? process.env.stage : ''
      }`;
      const color = '#0091ea'; // good, warning, danger
      await controlCenterWebhook.send({
        attachments: [
          {
            title,
            fallback: title,
            color,
            fields: [
              {
                title: 'Channel',
                value: channel,
                short: true,
              },
              {
                title: 'Zone',
                value: reservation.box.zone,
                short: true,
              },
            ],
          },
        ],
      });
    }

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
    const invokeAnalytics = new Invoke();
    await invokeAnalytics
      .service('analytics')
      .name('track')
      .body({ userId, name, data })
      .async()
      .go();
    console.timeEnd('track event');

    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
};

module.exports.checkBoxInfo = async (event: any) => {
  try {
    const { losantId, boxId, ip, client } = getBody(event);
    console.log({ losantId, boxId, ip, client });
    const api = new LosantApi();
    const payload = { boxId, ip, client };

    const command = 'info.current';
    await api.sendCommand(command, losantId, payload);
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not checkBoxInfo: ${e.stack}`);
  }
};

module.exports.debug = async (event: any) => {
  try {
    const { command, payload, losantId } = getBody(event);
    const api = new LosantApi();

    await api.sendCommand(command, losantId, payload);
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
};
