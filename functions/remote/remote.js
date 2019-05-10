const api = require('losant-rest');
const { respond, getBody } = require('serverless-helpers');

class Api {
  constructor() {
    this.client = api.createClient();
  }

  async setAuth(deviceId) {
    const response = await this.client.auth.authenticateDevice({
      credentials: {
        deviceId,
        key: process.env.losantKey,
        secret: process.env.losantSecret,
      },
    });
    this.client.setOption('accessToken', response.token);
  }

  async sendCommand(name, losantId, payload) {
    try {
      await this.setAuth(losantId);
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
    const { command, reservation } = getBody(event);
    const { losantId } = reservation.location;
    const { ip, clientAddress } = reservation.box;
    const { channel, channelMinor } = reservation.program;
    const api = new Api(losantId, ip);

    await api.sendCommand(command, losantId, { clientAddress, channel, channelMinor, ip });
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
};
