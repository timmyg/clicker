const dynamoose = require('dynamoose');
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
const { respond, invokeFunction } = require('serverless-helpers');
const directvEndpoint = 'https://www.directv.com/json';
let Program, ProgrammingArea;
require('dotenv').config();
const allChannels = [
  { channel: 5, channelTitle: 'NBC' },
  { channel: 9, channelTitle: 'ABC' },
  { channel: 12, channelTitle: 'CBS' },
  { channel: 19, channelTitle: 'FOX' },
  { channel: 206, channelTitle: 'ESPN' },
  { channel: 209, channelTitle: 'ESPN2' },
  { channel: 213, channelTitle: 'MLB' },
  { channel: 219, channelTitle: 'FS1' },
  { channel: 245, channelTitle: 'TNT' },
  { channel: 247, channelTitle: 'TBS' },
  { channel: 220, channelTitle: 'NBCSN' },
  { channel: 212, channelTitle: 'NFL' },
  { channel: 661, channelTitle: 'FSOH', channelMinor: 1 },
];
const zip = 45202;

function init() {
  Program = dynamoose.model(
    process.env.tableProgram,
    {
      id: {
        type: String,
        hashKey: true,
      },
      expires: Number,
      channel: Number,
      channelMinor: Number,
      channelTitle: String,
      title: String, // "Oklahoma State @ Kansas"
      episodeTitle: String, // "Oklahoma State at Kansas"
      description: String,
      durationMins: Number, // mins
      start: Date,
      end: Date,
      live: Boolean,
      repeat: Boolean,
      programId: String, // "SH000296530000" - use this to get summary
      channelCategories: [String], // ["Sports Channels"]
      subcategories: [String], // ["Basketball"]
      mainCategory: String, // "Sports"
      zip: Number,
      // dynamic fields
      nextProgramTitle: String,
      nextProgramStart: Date,
      points: Number,
    },
    {
      timestamps: true,
    },
  );
  // ProgrammingArea = dynamoose.model(
  //   process.env.tableProgrammingArea,
  //   {
  //     zip: {
  //       type: Number,
  //       hashKey: true,
  //     },
  //     localChannels: [Number],
  //     localSportsChannels: [Number],
  //   },
  //   {
  //     timestamps: true,
  //   },
  // );
}

module.exports.health = async event => {
  return respond(200, `${process.env.serviceName}: i\'m good (table: ${process.env.tableProgram})`);
};

module.exports.createAreaProgramming = async event => {
  const params = getPathParameters(event);
  const body = getBody(event);
  const { areaId } = params;

  const programmingArea = await ProgrammingArea.create({ id: areaId, ...body });
  return respond(201, programmingArea);
};

module.exports.getAreaProgramming = async event => {
  const params = getPathParameters(event);
  const { areaId } = params;

  const programmingArea = await ProgrammingArea.get({ id: areaId });
  return respond(200, programmingArea);
};

// TODO
module.exports.getAll = async event => {
  init();
  const initialChannels = allChannels;
  // get all programs for right now
  const now = moment().unix() * 1000;
  const in25Mins =
    moment()
      .add(25, 'minutes')
      .unix() * 1000;

  const currentProgramming = await Program.scan()
    .filter('start')
    .lt(now)
    .and()
    .filter('end')
    .gt(now)
    .and()
    .filter('zip') // Zip is hardcoded!
    .eq(zip)
    .all()
    .exec();

  const nextProgramming = await Program.scan()
    .filter('start')
    .lt(in25Mins)
    .and()
    .filter('end')
    .gt(in25Mins)
    .and()
    .filter('zip') // Zip is hardcoded!
    .eq(zip)
    .all()
    .exec();

  // add in next program if within 15 mins
  initialChannels.forEach((p, index, arr) => {
    // find if in current programming
    const currentProgram = currentProgramming.find(cp => cp.channel === p.channel);

    // keep minor channel if has one
    currentProgram.channelMinor = p.channelMinor;

    // find if in next programming
    const nextProgram = nextProgramming.find(np => np.channel === p.channel);

    // if next program is not the same as current one
    if (currentProgram && nextProgram && nextProgram.programId !== currentProgram.programId) {
      currentProgram.nextProgramTitle = nextProgram.title;
      currentProgram.nextProgramStart = nextProgram.start;
    }
    if (currentProgram) {
      arr[index] = currentProgram;
    }
  });
  

  const cleanPrograms = cleanupTitles(initialChannels);
  const rankedPrograms = rankPrograms(cleanPrograms);
  return respond(200, rankedPrograms);
};

function cleanupTitles(programs) {
  programs.forEach((program, i) => {
    programs[i] = cleanup(program);
  });
  return programs;
}

function cleanup(program) {
  if (program.title.toLowerCase() === 'mlb baseball') {
    if (program.episodeTitle && (program.episodeTitle.includes(' @ ') || program.episodeTitle.includes(' at '))) {
      program.title = program.episodeTitle;
    } else if (program.description && (program.description.includes(' @ ') || program.description.includes(' at '))) {
      program.title = program.description;
    }
  }
  return program;
}

function rankPrograms(programs) {
  programs.forEach((program, i) => {
    programs[i] = rank(program);
  });
  return programs.sort((a, b) => b.points - a.points);
}

function rank(program) {
  const terms = [{ term: ' @ ', points: 2 }, { term: 'reds', points: 3 }, { term: 'cincinnati', points: 5 }];
  const { title } = program;
  const searchTarget = title;
  let totalPoints = 0;
  terms.forEach(({ term, points }) => {
    searchTarget.toLowerCase().includes(term.toLowerCase()) ? (totalPoints += points) : null;
  });

  program.live ? (totalPoints += 2) : null;
  program.repeat ? (totalPoints -= 4) : null;

  program.mainCategory === 'Sports' ? (totalPoints += 2) : null;

  if (program.subcategories) {
    program.subcategories.includes('Playoffs') ? (totalPoints += 5) : null;
    if (program.subcategories.includes('Golf')) {
      if (program.title.includes('PGA Championship') && program.live) {
        totalPoints += 5;
      }
    }
  }

  program.points = totalPoints;
  return program;
}

module.exports.syncNew = async event => {
  try {
    init();
    const url = `${directvEndpoint}/channelschedule`;
    // TODO dont hardcode channels, different depending on zip code!
    const channelsToPull = allChannels.map(c => c.channel);
    // TODO add zip code cookie
    const startTime = moment()
      .utc()
      .subtract(4, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
    const hours = 8;
    const params = { channels: channelsToPull.join(','), startTime, hours };
    const headers = {
      Cookie: `dtve-prospect-zip=${zip};`,
    };
    const result = await axios.get(url, { params, headers });
    const { schedule } = result.data;
    console.info(`pulled ${schedule.length} channels`);
    const allPrograms = build(schedule, zip);
    const transformedPrograms = transformPrograms(allPrograms);
    const dbResult = await Program.batchPut(transformedPrograms);

    await invokeFunction(`programs-${process.env.stage}-syncDescriptions`);

    return respond(201, dbResult);
  } catch (e) {
    console.error(e);
    return respond(400, `Could not create: ${e.stack}`);
  }
};

module.exports.syncDescriptions = async event => {
  // find programs by unique programID without descriptions
  init();
  let allDescriptionlessPrograms = await Program.scan('description')
    .null()
    .all()
    .exec();

  allDescriptionlessPrograms = allDescriptionlessPrograms.sort((a, b) => {
    return a.start - b.start;
  });

  console.log('allDescriptionlessPrograms:', allDescriptionlessPrograms.length);
  const uniqueProgramIds = [...new Set(allDescriptionlessPrograms.map(p => p.programId))];
  console.log('uniqueProgramIds', uniqueProgramIds.length);
  // call endpoint for each program
  for (const programId of uniqueProgramIds) {
    console.log('update program', programId);
    try {
      const url = `${directvEndpoint}/program/flip/${programId}`;
      const result = await axios.get(url);
      const { programDetail } = result.data;
      const { description } = programDetail;

      const programsToUpdate = await Program.scan()
        .filter('programId')
        .eq(programId)
        .all()
        .exec();

      programsToUpdate.forEach((part, index, arr) => {
        arr[index]['description'] = description;
      });
      console.log('programsToUpdate', programsToUpdate.length, programsToUpdate[0]);
      await Program.batchPut(programsToUpdate);
    } catch (e) {
      console.error(e);
    }
  }
  return respond(200);
};

function transformPrograms(programs) {
  const transformedPrograms = [];
  programs.forEach(p => {
    transformedPrograms.push(new Program(p));
  });
  return transformedPrograms;
}

function build(dtvSchedule, zip) {
  const programs = [];
  dtvSchedule.forEach(channel => {
    channel.schedules.forEach(program => {
      program.programId = program.programID;
      if (program.programId !== '-1') {
        console.log({ channel, program });
        program.channel = channel.chNum;
        program.channelTitle = channel.chCall;

        program.title = program.title !== 'Programming information not available' ? program.title : null;
        program.durationMins = program.duration;

        program.channelCategories = channel.chCat;
        program.subcategories = program.subcategoryList;
        program.mainCategory = program.mainCategory;

        program.live = program.ltd === 'Live' ? true : false;
        program.repeat = program.repeat;
        program.zip = zip;
        program.id = generateId(program);
        program.start = new Date(parseInt(moment(program.airTime).unix() * 1000));
        program.end = new Date(
          parseInt(
            moment(program.airTime)
              .add(program.durationMins, 'minutes')
              .unix() * 1000,
          ),
        );
        // expire 6 hours from end time, or 1 week
        program.expires =
          moment(program.end)
            .add(6, 'hours')
            .diff(moment(), 'seconds') || 60 * 60 * 24 * 7;
        programs.push(program);
      }
    });
  });
  // filter out duplicates - happens with sd/hd channels
  const filteredPrograms = uniqBy(programs, 'id');
  return filteredPrograms;
}

function generateId(program) {
  const { channel, airTime } = program;
  const id = channel + airTime;
  return uuid(id, uuid.DNS);
}

module.exports.build = build;
module.exports.generateId = generateId;
