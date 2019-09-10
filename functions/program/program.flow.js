// @flow
const dynamoose = require('dynamoose');
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
const { respond, invokeFunctionSync, getPathParameters, getBody } = require('serverless-helpers');
const directvEndpoint = 'https://www.directv.com/json';
let Program, ProgramArea;
require('dotenv').config();

declare class process {
  static env: {
    tableProgram: string,
    serviceName: string,
    tableProgram: string,
    tableProgramArea: string,
    stage: string,
  };
}

class programAreaType {
  zip: number;
  channels: [number];
}

const minorChannels: number[] = [661];

const nationalChannels: number[] = [
  206, //ESPN
  209, //ESPN2
  208, //ESPNU
  207, //ESPNN
  614, //ESPNC
  213, //MLB
  219, //FS1
  220, //NBCSN
  212, //NFL
  217, //TNNSHD
  215, //NHLHD
  216, //NBAHD

  // optional channels, but leave for syncing
  218, //GOLF
  602, //TVG
  612, //ACCN
  618, //FS2
  620, //FS2
  610, //BTN
  611, //SECHD
  605, //SPMN
  606, //OTDR
  221, //CBSSN // premium
  //, 245 //TNT
  //, 247 //TBS
  //, 661 //FSOHhannelMinor: 1 },
  //, 600 //SMXHD
  701, //NFLMX // 4 game mix
  702, //NFLMX // 8 game mix
  703, //NFLRZ // Redzone (premium)
  704, //NFLFAN // Fantasy Zone (premium)
  705, //NFL
  706, //NFL
  707, //NFL
  708, //NFL
  709, //NFL
  710, //NFL
  711, //NFL
  712, //NFL
  713, //NFL
  714, //NFL
  715, //NFL
  716, //NFL
  717, //NFL
  718, //NFL
  //, 719 //NFL
  //, 104 //DTV4K
  //, 105 //LIVE4K
  //, 106 //LIVE4K2
];
const zipDefault = 45202;

function init() {
  Program = dynamoose.model(
    process.env.tableProgram,
    {
      id: {
        type: String,
        hashKey: true,
      },
      // expires: Number,
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
      sports: Boolean,
      programId: String, // "SH000296530000" - use this to get summary
      channelCategories: [String], // ["Sports Channels"]
      subcategories: [String], // ["Basketball"]
      mainCategory: String, // "Sports"
      zip: Number,
      // dynamic fields
      nextProgramTitle: String,
      nextProgramStart: Date,
      points: Number,
      synced: Boolean, // synced with description from separate endpoint
    },
    {
      timestamps: true,
      expires: {
        ttl: 86400,
        attribute: 'expires',
        returnExpiredItems: false,
        defaultExpires: x => {
          // expire 30 minutes after end
          return moment(x.end)
            .add(30, 'minutes')
            .toDate();
        },
      },
    },
  );
  ProgramArea = dynamoose.model(
    process.env.tableProgramArea,
    {
      zip: {
        type: Number,
        hashKey: true,
      },
      channels: [Number],
    },
    {
      timestamps: true,
    },
  );
}

module.exports.health = async (event: any) => {
  console.log('hi', process.env.tableProgram);
  return respond(200, `${process.env.serviceName}: i\'m flow good (table: ${process.env.tableProgram})`);
};

module.exports.createArea = async (event: any) => {
  const { zip, channels } = getBody(event);
  init();
  const programArea = await ProgramArea.create({ zip, channels });
  return respond(200, programArea);
};

module.exports.getAll = async (event: any) => {
  const params = getPathParameters(event);
  const { locationId } = params;

  const locationResult = await invokeFunctionSync(
    `location-${process.env.stage}-get`,
    null,
    { id: locationId },
    event.headers,
  );

  const location = locationResult.data;

  init();
  const initialChannels = nationalChannels;
  // get all programs for right now
  const now = moment().unix() * 1000;
  const in25Mins =
    moment()
      .add(25, 'minutes')
      .unix() * 1000;

  console.time('current + next Programming');

  let programs = [];
  // national
  programs.push(
    Program.scan()
      .filter('start')
      .lt(now)
      .and()
      .filter('end')
      .gt(now)
      // .and()
      // .filter('mainCategory')
      // .eq('Sports')
      .and()
      .filter('zip')
      .null()
      .all()
      .exec(),
  );

  if (location.channels && location.channels.local) {
    console.log('include local channels!', now, location.zip);
    programs.push(
      Program.scan()
        .filter('start')
        .lt(now)
        .and()
        .filter('end')
        .gt(now)
        .and()
        .filter('zip')
        .eq(location.zip)
        .all()
        .exec(),
    );
  }

  let programsResult = await Promise.all(programs);
  programsResult = Array.prototype.concat.apply([], programsResult);

  console.log('programsResult', programsResult.length);

  console.timeEnd('current + next Programming');

  console.time('remove excluded');
  console.log('exclude', location.channels);
  if (location.channels && location.channels.exclude) {
    const excludedChannels = location.channels.exclude.map(function(item) {
      return parseInt(item, 10);
    });
    console.log(excludedChannels);
    console.log(programsResult.length);
    programsResult = programsResult.filter(p => !excludedChannels.includes(p.channel));
    console.log(programsResult.length);
  }
  console.timeEnd('remove excluded');

  console.time('rank');
  const rankedPrograms = rankPrograms(programsResult);
  // const rankedPrograms = rankPrograms(currentNational.concat(currentPremium, currentLocal));
  console.timeEnd('rank');
  return respond(200, rankedPrograms);
};

function rankPrograms(programs) {
  programs.forEach((program, i) => {
    programs[i] = rank(program);
  });
  return programs.sort((a, b) => b.points - a.points);
}

function rank(program) {
  if (!program || !program.title) {
    return program;
  }
  const terms = [
    // { term: ' @ ', points: 2 },
    { term: 'reds', points: 3 },
    { term: 'fc cincinnati', points: 3 },
    { term: 'bengals', points: 3 },
    { term: 'bearcats', points: 3 },
    { term: 'xavier', points: 3 },
    { term: 'college football', points: 1 },
  ];
  const { title } = program;
  const searchTarget = title;
  let totalPoints = 0;
  terms.forEach(({ term, points }) => {
    searchTarget.toLowerCase().includes(term.toLowerCase()) ? (totalPoints += points) : null;
  });

  program.live ? (totalPoints += 1) : null;
  program.repeat ? (totalPoints -= 2) : null;

  program.mainCategory === 'Sports' ? (totalPoints += 2) : null;
  program.channelTitle === 'ESPNHD' ? (totalPoints += 1) : null;

  program.sports = program.mainCategory === 'Sports';

  if (program.subcategories) {
    program.subcategories.includes('Playoffs') || program.subcategories.includes('Playoff') ? (totalPoints += 5) : null;
    // if (program.subcategories.includes('Golf')) {
    if (
      (program.title.includes('PGA Championship') ||
        program.title.includes('U.S. Open') ||
        program.title.includes('Open Championship')) &&
      program.live
    ) {
      totalPoints += 5;
    }
    // }
  }

  program.points = totalPoints;
  return program;
}

module.exports.syncNew = async (event: any) => {
  try {
    init();

    // sync national channels
    console.log('sync national channels');
    await syncChannels(nationalChannels);

    // sync local channels
    const programAreas: programAreaType[] = await ProgramArea.scan()
      .all()
      .exec();
    for (const area of programAreas) {
      console.log(`sync local channels: ${area.zip}`);
      await syncChannels(area.channels, area.zip);
    }

    return respond(201);
  } catch (e) {
    console.error(e);
    return respond(400, `Could not create: ${e.stack}`);
  }
};

async function syncChannels(channels: any, zip: number = zipDefault) {
  // channels may have minor channel, so get main channel number
  const channelsString = getChannels(channels).join(',');

  const url = `${directvEndpoint}/channelschedule`;
  const startTime = moment()
    .utc()
    .subtract(4, 'hours')
    .minutes(0)
    .seconds(0)
    .toString();
  const hours = 8;

  const params = { channels: channelsString, startTime, hours };
  const headers = {
    Cookie: `dtve-prospect-zip=${zip || zipDefault};`,
  };
  const method = 'get';
  console.log('getting channels....', params, headers);
  let result = await axios({ method, url, params, headers });
  console.log({ result });

  let { schedule } = result.data;
  let allPrograms = build(schedule, zip);
  let transformedPrograms = buildProgramObjects(allPrograms);
  let dbResult = await Program.batchPut(transformedPrograms);
}

module.exports.syncDescriptions = async (event: any) => {
  // find programs by unique programID without descriptions
  init();
  const maxPrograms = 3;
  let descriptionlessPrograms = await Program.scan('description')
    .null()
    .and()
    .filter('end')
    .gt(moment().unix() * 1000)
    .filter('synced')
    .null()
    // .not()
    // .eq(true)
    .all()
    .exec();

  if (!descriptionlessPrograms.length) {
    return respond(204);
  }

  descriptionlessPrograms = descriptionlessPrograms.sort((a, b) => {
    return a.start - b.start;
  });

  descriptionlessPrograms = descriptionlessPrograms.slice(0, maxPrograms);

  const uniqueProgramIds = [...new Set(descriptionlessPrograms.map(p => p.programId))];
  // call endpoint for each program
  for (const programId of uniqueProgramIds) {
    try {
      const url = `${directvEndpoint}/program/flip/${programId}`;
      const result = await axios.get(url);
      const { programDetail } = result.data;
      const { description } = programDetail;

      const programsToUpdate = descriptionlessPrograms.filter(p => p.programId === programId);

      programsToUpdate.forEach((part, index, arr) => {
        arr[index]['description'] = description;
        arr[index]['synced'] = true;
      });
      const response = await Program.batchPut(programsToUpdate);
    } catch (e) {
      console.log('sync description failed');
      console.error(e);
      // TODO duplicate codde
      const programsToUpdate = descriptionlessPrograms.filter(p => p.programId === programId);
      programsToUpdate.forEach((part, index, arr) => {
        // arr[index]['description'] = description;
        arr[index]['synced'] = false;
      });
      const response = await Program.batchPut(programsToUpdate);
    }
  }
  return respond(200);
};

function transformChannels(channelArray) {
  console.log('transformChannels', channelArray);
  const channels = [];
  for (var i = 0, len = channelArray.length; i < len; i++) {
    let channel, channelMinor;
    channel = channelArray[i].split('-')[0];
    channelMinor = channelArray[i].split('-')[1];
    channels.push({ channel: parseInt(channel), channelMinor: channelMinor ? parseInt(channelMinor) : undefined });
  }
  console.log('transformedChannels', channels);
  return channels;
}

function buildProgramObjects(programs) {
  const transformedPrograms = [];
  programs.forEach(p => {
    transformedPrograms.push(new Program(p));
  });
  return transformedPrograms;
}

function build(dtvSchedule: any, zip: number) {
  // pass in channels array (channel, channelMinor) so that we can include the minor number, if needed
  const programs = [];
  dtvSchedule.forEach(channel => {
    channel.schedules.forEach(program => {
      program.programId = program.programID;
      if (program.programId !== '-1') {
        program.channel = channel.chNum;
        program.channelTitle = getLocalChannelName(channel.chName) || channel.chCall;

        // if channel is in minors list, add a -1 to it
        if (minorChannels.includes(program.channel)) {
          program.channelMinor = 1;
        }

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
        programs.push(program);
      }
    });
  });
  // filter out duplicates - happens with sd/hd channels
  const filteredPrograms = uniqBy(programs, 'id');
  return filteredPrograms;
}

function generateId(program: any) {
  const { programId, zip } = program;
  const id = programId + (zip || '');
  // console.log(id, uuid.DNS);
  return uuid(id, uuid.DNS);
}

function getLocalChannelName(chName: string) {
  // chName will be Cincinnati, OH WCPO ABC 9 SD
  if (chName.toLowerCase().includes(' abc ')) {
    return 'ABC';
  } else if (chName.toLowerCase().includes(' nbc ')) {
    return 'NBC';
  } else if (chName.toLowerCase().includes(' fox ')) {
    return 'FOX';
  } else if (chName.toLowerCase().includes(' cbs ')) {
    return 'CBS';
  }
}

function getChannels(channels: number[]): number[] {
  return channels.map(c => Math.floor(c));
}
function getChannelsWithMinor(channels: number[]): string[] {
  return channels.map(c => {
    const arr = (c + '').split('.');
    let channel = arr[0];
    if (arr[1]) {
      channel = channel.concat(`-${arr[1]}`);
    }
    return channel;
  });
}

module.exports.build = build;
module.exports.generateId = generateId;
module.exports.getLocalChannelName = getLocalChannelName;
module.exports.getChannels = getChannels;
module.exports.getChannelsWithMinor = getChannelsWithMinor;
