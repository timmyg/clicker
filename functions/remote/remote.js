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
      console.log('send command -------->');
      console.log({
        applicationId: process.env.losantAppId,
        deviceId: losantId,
        deviceCommand: { name, payload },
      });
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
    const { command } = getPathParameters(event);
    const body = getBody(event);
    // TODO why body.body?
    console.log(body);
    const { payload } = body.body;
    const { losantId, client, channel, ip } = payload;
    const api = new Api(losantId, ip);

    await api.sendCommand(command, losantId, { client, channel, ip });
    return respond();
  } catch (e) {
    console.error(e);
    return respond(400, `Could not tune: ${e.stack}`);
  }
};
