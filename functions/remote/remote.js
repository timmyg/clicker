const losantApi = require('losant-rest');
const { respond, getBody } = require('serverless-helpers');

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
    const { command, key, reservation } = getBody(event);
    const { losantId } = reservation.location;
    const { ip, clientAddress: client } = reservation.box;
    const { channel, channelMinor } = reservation.program;
    const api = new LosantApi();

    console.log(command, losantId, client, channel, channelMinor, ip, key);
    await api.sendCommand(command, losantId, { client, channel, channelMinor, ip, key });
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
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
