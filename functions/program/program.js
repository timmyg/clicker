const dynamoose = require('dynamoose');
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
require('dotenv').config();

const Program = dynamoose.model(
  process.env.tableProgram,
  {
    id: {
      type: String,
      hashKey: true,
    },
    chId: String, // 206 (from channel)
    chNum: String, // 206 (from channel)
    chCall: String, // "ESPN" (from channel)
    chHd: Boolean, // false (from channel)
    chCat: [String], // ["Sports Channels"]
    blackOut: Boolean, // false (from channel)
    description: String, // null
    title: String, // "Oklahoma State @ Kansas"
    duration: Number, // 120
    price: Number, // 0
    repeat: Boolean, // false
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
    const url = 'https://www.directv.com/json/channelschedule';
    const channelsToPull = [206, 209, 208, 219, 9, 19, 12, 5, 611, 618, 660, 701];
    const startTime = moment()
      .utc()
      .subtract(2, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
    const hours = 8;
    console.log({ url, params: { channels: channelsToPull.join(','), startTime, hours } });
    const params = { channels: channelsToPull.join(','), startTime, hours };
    const result = await axios.get(url, { params });
    const { schedule } = result.data;
    console.info(`pulled ${schedule.length} channels`);
    const allPrograms = build(schedule);
    console.log(allPrograms.length);
    console.log(JSON.stringify(allPrograms));
    const dbResult = await Program.batchPut(allPrograms);
    console.log({ dbResult });
    return generateResponse(201, dbResult);
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not create: ${e.stack}`);
  }
};

function build(dtvSchedule) {
  const allPrograms = [];
  dtvSchedule.forEach(channel => {
    channel.schedules.forEach(program => {
      if (program.programId !== '-1') {
        program.id = generateId(program);
        program.chId = channel.chId;
        program.chNum = channel.chNum;
        program.chCall = channel.chCall;
        program.chHd = channel.chHd;
        program.chCat = channel.chCat;
        program.blackOut = channel.blackOut;
        allPrograms.push(new Program(program));
      }
    });
  });
  // filter out duplicates - happens with sd/hd channels
  const filteredPrograms = _.uniqBy(allPrograms, 'id');
  return filteredPrograms;
}

function generateId(program) {
  const { chNum, airTime } = program;
  const id = chNum + airTime;
  return uuid(id, uuid.DNS);
}
