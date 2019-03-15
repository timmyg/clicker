const dynamoose = require('dynamoose');
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
const { generateResponse } = require('serverless-helpers');
const directvEndpoint = 'https://www.directv.com/json';
let Program;
require('dotenv').config();

function init() {
  Program = dynamoose.model(
    process.env.tableProgram,
    {
      id: {
        type: String,
        hashKey: true,
      },
      expires: Number,
      chId: String, // 206 (from channel)
      chNum: String, // 206 (from channel)
      chCall: String, // "ESPN" (from channel)
      chHd: Boolean, // false (from channel)
      chCat: [String], // ["Sports Channels"]
      blackOut: Boolean, // false (from channel)
      description: String, // null, populated later
      progType: String, // null, populated later
      title: String, // "Oklahoma State @ Kansas"
      duration: Number, // 120
      endTime: Date, // created
      price: Number, // 0
      repeat: Boolean, // false
      ltd: String, // "Live"
      programID: String, // "SH000296530000" - use this to get summary
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
}

module.exports.health = async event => {
  return generateResponse(200, `${process.env.serviceName}: i\'m good (table: ${process.env.tableProgram})`);
};

module.exports.pullNew = async event => {
  try {
    init();
    const url = `${directvEndpoint}/channelschedule`;
    // TODO dont hardcode channels, different depending on zip code!
    const channelsToPull = [206, 209, 208, 219, 9, 19, 12, 5, 611, 618, 660, 701];
    // TODO add zip code cookie
    const startTime = moment()
      .utc()
      .subtract(6, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
    const hours = 24;
    const params = { channels: channelsToPull.join(','), startTime, hours };
    const result = await axios.get(url, { params });
    const { schedule } = result.data;
    console.info(`pulled ${schedule.length} channels`);
    const allPrograms = build(schedule);
    const transformedPrograms = transformPrograms(allPrograms);
    const dbResult = await Program.batchPut(transformedPrograms);
    return generateResponse(201, dbResult);
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not create: ${e.stack}`);
  }
};

module.exports.pullDescriptions = async event => {
  // find programs by unique programID without descriptions
  const allPrograms = await Program.query('description').null();
  console.log('null program descriptions:', allPrograms.length);
  const uniqueProgramIds = [...new Set(allPrograms.map(p => p.programID))];
  console.log('unique null program descriptions:', uniqueProgramIds.length);
  // call endpoint for each program
  for (const programId of uniqueProgramIds) {
    console.log('update program', programId);
    const url = `${directvEndpoint}/program/flip/${programId}`;
    const result = await axios.get(url);
    console.log('result', result);
    const { programDetail } = result.data;
    const { description, progType } = programDetail;
    // save description for all program ids
    // await Program.update({ programID: programId }, { description, progType });
    const programs = await Program.batchGet([{ programID: programId }]);
    console.log('programs to update:', programs.length);
    for (const p of programs) {
      await Program.update({ id: p.id }, { description, progType });
    }
  }
  return generateResponse(200);
};

module.exports.assignRelevance = async event => {};

function transformPrograms(programs) {
  const allPrograms = [];
  programs.forEach(p => {
    allPrograms.push(new Program(p));
  });
  return allPrograms;
}

function build(dtvSchedule) {
  const allPrograms = [];
  dtvSchedule.forEach(channel => {
    channel.schedules.forEach(program => {
      program.chId = channel.chId;
      program.chNum = channel.chNum;
      program.chCall = channel.chCall;
      program.chHd = channel.chHd;
      program.chCat = channel.chCat;
      program.blackOut = channel.blackOut;
      program.id = generateId(program);
      program.endTime = new Date(
        parseInt(
          moment(program.airTime)
            .add(program.duration, 'minutes')
            .unix() + '000',
        ),
      );
      // expire 6 hours from end time, or 1 week
      program.expires =
        moment(program.endTime)
          .add(6, 'hours')
          .diff(moment(), 'seconds') || 60 * 60 * 24 * 7;
      console.log({ program });
      allPrograms.push(program);
    });
  });
  // filter out duplicates - happens with sd/hd channels
  const filteredPrograms = uniqBy(allPrograms, 'id');
  return filteredPrograms;
}

function generateId(program) {
  const { chNum, airTime } = program;
  const id = chNum + airTime;
  return uuid(id, uuid.DNS);
}

module.exports.build = build;
module.exports.generateId = generateId;
