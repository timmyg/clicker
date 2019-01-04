require('dotenv').config({ path: '/api/.env' });
const api = require('losant-rest');

class Api {
  constructor() {
    this.client = api.createClient();
  }

  async setAuth(deviceId) {
    const response = await this.client.auth.authenticateDevice({
      credentials: {
        deviceId,
        key: process.env.LOSANT_KEY,
        secret: process.env.LOSANT_SECRET,
      },
    });
    this.client.setOption('accessToken', response.token);
  }

  async sendCommand(losantId, name, payload) {
    try {
      await this.setAuth(losantId);
      const params = {
        applicationId: process.env.LOSANT_APPLICATION_ID,
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

function generateResponse(statusCode, body) {
  let msg = body;
  if (typeof msg === 'string') {
    msg = { message: msg };
  }
  return {
    statusCode,
    body: JSON.stringify(msg),
  };
}

/**
 * Registers a device if it has not been registered (losantId is PK)
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 * @param   {string} name command name (event.body)
 * @param   {object} payload payload to send to losant (event.body)
 *
 * @returns {number} 200, 400
 */
module.exports.command = async event => {
  try {
    const { losantId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { name, payload } = body;
    const api = new Api(losantId);
    await api.sendCommand(losantId, name, payload);
    return generateResponse(200, 'ok');
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not send command: ${e.stack}`);
  }
};
