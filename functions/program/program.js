const dynamoose = require('dynamoose');
const axios = require('axios');
const uuid = require('uuid/v5');
require('dotenv').config();

const Program = dynamoose.model(
  process.env.tableProgram,
  {
    programId: {
      type: String,
      hashKey: true,
    },
    id: {
      type: String,
      // hashKey: true,
      default: uuid,
    },
    description: String, // null
    title: String, // "Oklahoma State @ Kansas"
    duration: Number, // 120
    price: Number, // 0
    repeat: boolean, // false
    ltd: String, // "Live"
    programID: String, // "SH000296530000"
    blackoutCode: String,
    airTime: Date, // "2019-02-06T18:00:00.000+0000"
    subcategoryList: [String], // ["Basketball"]
    mainCategory: String, // "Sports"
    episodeTitle: String, // "Oklahoma State at Kansas"
    format: String, // "HD"
    mainCategory: String, // "Sports"
    hd: Number, // 1
    liveStreaming: String, // "B"
    rating: String, // "NR (Not Rated)"
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
  return generateResponse(200, `${process.env.serviceName}: i\'m good (table: ${process.env.tableProgram})`);
};

/**
 * Registers a device if it has not been registered (losantId is PK)
 * @param   {string} losantId device identifier for Losant platform (event.body)
 * @param   {string} location human readable location for reference (event.body)
 *
 * @returns {number} 201, 400
 */
module.exports.pull = async event => {
  try {
    const url = process.env.GUIDE_ENDPOINT;
    const channelsToPull = [206, 209, 208, 219, 9, 19, 12, 5, 611, 618, 660, 701];
    const startTime = moment()
      .utc()
      .subtract(6, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
    const hours = 24;
    const result = await axios.get(url, { params: { channels: channelsToPull.join(','), startTime, hours } });
    const { schedule } = result.data;
    schedule.forEach(channel => {
      Program.batchPut(channel.schedules);
    });
    return generateResponse(201);
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not create: ${e.stack}`);
  }
};
