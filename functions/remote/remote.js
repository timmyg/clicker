const losantApi = require('losant-rest');
const { respond, getBody, track, invokeFunctionAsync } = require('serverless-helpers');

class LosantApi {
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

module.exports.health = async => {
  return respond();
};

module.exports.command = async event => {
  try {
    const { command, key, reservation, source } = getBody(event);
    const { losantId, id: locationId } = reservation.location;
    const { ip, clientAddress: client, id: boxId } = reservation.box;
    const { channel, channelMinor } = reservation.program;
    const api = new LosantApi();

    console.log(command, losantId, client, channel, channelMinor, ip, key, source);
    await api.sendCommand(command, losantId, { client, channel, channelMinor, ip, key });
    await invokeFunctionSync(
      `location-${process.env.stage}-updateChannel`,
      { channel, source }, // body
      { id: locationId, boxId }, // path params
      null,
      null,
    );

    let eventName;
    if (source === 'app') {
      eventName = 'App Zap';
    } else if (source === 'control center') {
      eventName = 'Control Center Zap';
    }

    const userId = reservation.userId;
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
    await invokeFunctionAsync(`analytics-${process.env.stage}-track`, { userId, name, data });
    console.timeEnd('track event');

    console.time('update channel');
    await invokeFunctionAsync(
      `location-${process.env.stage}-updateChannel`,
      { channel, source }, // body
      { id: locationId, boxId }, // path params
    );
    console.timeEnd('update channel');

    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
};

module.exports.checkBoxInfo = async event => {
  try {
    const { losantId, boxId, ip, client } = getBody(event);
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

module.exports.debug = async event => {
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
