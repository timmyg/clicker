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

  async sendCommand(losantId, name, payload) {
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
    const body = getBody(event);
    const { losantId, name, payload } = body;
    const api = new Api(losantId);
    await api.sendCommand(losantId, name, payload);
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not send command: ${e.stack}`);
  }
};
