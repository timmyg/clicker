require('dotenv').config();

const axios = require('axios');

class Api {
  constructor() {
    this.axios = axios.create({
      baseURL: process.env.LOSANT_BASE_URL,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendCommand(losantId, name, payload) {
    try {
      console.info(process.env.LOSANT_BASE_URL, `/devices/${losantId}`, { name, payload });
      return await this.axios.post(`/devices/${losantId}`, { name, payload });
    } catch (error) {
      return console.error(error.response.data);
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
    const api = new Api();
    await api.sendCommand(losantId, name, payload);
    return generateResponse(200, 'ok');
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not send command: ${e.stack}`);
  }
};
