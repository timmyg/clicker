const losantApi = require('losant-rest');
const { respond, getBody, invokeFunctionSync, track } = require('serverless-helpers');

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

    console.time('track event');
    let event;
    if (source === 'app') {
      event = 'App Zap';
    } else if (source === 'control center') {
      event = 'Control Center Zap';
    }
    await track({
      userId: reservation.userId,
      event,
      properties: {
        channel: reservation.program.channel,
        channelMinor: reservation.program.channelMinor,
        channelTitle: reservation.program.channelTitle,
        programTitle: reservation.program.title,
        programCategory: reservation.program.mainCategory,
        programDescription: reservation.program.description,
        boxLabel: reservation.box.label,
        minutes: reservation.minutes,
        points: reservation.points,
        boxZone: reservation.box.zone,
        cost: reservation.cost,
        locationId: reservation.location.id,
        locationName: reservation.location.name,
        locationNeighborhood: reservation.location.neighborhood,
      },
    });
    console.timeEnd('track event');

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
