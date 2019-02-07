const dynamoose = require('dynamoose');
const axios = require('axios');
require('dotenv').config();

const Program = dynamoose.model(
  process.env.tableWidget,
  {
    losantId: {
      type: String,
      hashKey: true,
    },
    location: String,
    devices: [{ name: String, ip: String, mac: String }],
    boxes: [Object],
    options: Object,
    version: Object,
    mode: Number,
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

function generateResponse(statusCode, body = {}) {
  let msg = body;
  if (typeof msg === 'string') {
    msg = { message: msg };
  }
  return {
    statusCode,
    body: JSON.stringify(msg),
  };
}

module.exports.health = async event => {
  return generateResponse(200, `${process.env.serviceName}: i\'m good (table: ${process.env.tableWidget})`);
};

/**
 * Registers a device if it has not been registered (losantId is PK)
 * @param   {string} losantId device identifier for Losant platform (event.body)
 * @param   {string} location human readable location for reference (event.body)
 *
 * @returns {number} 201, 400
 */
module.exports.create = async event => {
  try {
    const url = process.env.GUIDE_ENDPOINT;
    const channels = [206, 209, 208, 219, 9, 19, 12, 5, 611, 618, 660, 701];
    const startTime = moment()
      .utc()
      .subtract(6, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
    const hours = 24;
    const result = await axios.get(url, { params: { channels: channels.join(','), startTime, hours } });
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not create: ${e.stack}`);
  }
};
