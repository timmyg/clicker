const dynamoose = require('dynamoose');
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
const { respond, invokeFunctionSync, getPathParameters, getBody } = require('serverless-helpers');
const directvEndpoint = 'https://www.directv.com/json';
let Program, ProgramArea;
require('dotenv').config();
const nationalChannels = [
  { channel: 206, channelTitle: 'ESPN' },
  { channel: 209, channelTitle: 'ESPN2' },
  { channel: 208, channelTitle: 'ESPNU' },
  { channel: 207, channelTitle: 'ESPNN' },
  { channel: 614, channelTitle: 'ESPNC' },
  { channel: 213, channelTitle: 'MLB' },
  { channel: 219, channelTitle: 'FS1' }, // { channel: 5, channelTitle: 'NBC' },
  { channel: 220, channelTitle: 'NBCSN' },
  { channel: 212, channelTitle: 'NFL' }, // { channel: 9, channelTitle: 'ABC' },
  { channel: 217, channelTitle: 'TNNSHD' },
  { channel: 215, channelTitle: 'NHLHD' },
  { channel: 216, channelTitle: 'NBAHD' },

  // optional channels, but leave for syncing
  { channel: 218, channelTitle: 'GOLF' },
  { channel: 602, channelTitle: 'TVG' },
  { channel: 612, channelTitle: 'ACCN' },
  { channel: 618, channelTitle: 'FS2' },
  { channel: 620, channelTitle: 'FS2' },
  { channel: 610, channelTitle: 'BTN' },
  { channel: 611, channelTitle: 'SECHD' },
  { channel: 605, channelTitle: 'SPMN' },
  { channel: 606, channelTitle: 'OTDR' },
  { channel: 221, channelTitle: 'CBSSN' }, // premium
  // { channel: 245, channelTitle: 'TNT' },
  // { channel: 247, channelTitle: 'TBS' },
  // { channel: 661, channelTitle: 'FSOH', channelMinor: 1 },
  // { channel: 600, channelTitle: 'SMXHD' },
  { channel: 701, channelTitle: 'NFLMX' }, // 4 game mix
  { channel: 702, channelTitle: 'NFLMX' }, // 8 game mix
  { channel: 703, channelTitle: 'NFLRZ' }, // Redzone (premium)
  { channel: 704, channelTitle: 'NFLFAN' }, // Fantasy Zone (premium)
  { channel: 705, channelTitle: 'NFL' },
  { channel: 706, channelTitle: 'NFL' },
  { channel: 707, channelTitle: 'NFL' },
  { channel: 708, channelTitle: 'NFL' },
  { channel: 709, channelTitle: 'NFL' },
  { channel: 710, channelTitle: 'NFL' },
  { channel: 711, channelTitle: 'NFL' },
  { channel: 712, channelTitle: 'NFL' },
  { channel: 713, channelTitle: 'NFL' },
  { channel: 714, channelTitle: 'NFL' },
  { channel: 715, channelTitle: 'NFL' },
  { channel: 716, channelTitle: 'NFL' },
  { channel: 717, channelTitle: 'NFL' },
  { channel: 718, channelTitle: 'NFL' },
  // { channel: 719, channelTitle: 'NFL' },
  // { channel: 104, channelTitle: 'DTV4K' },
  // { channel: 105, channelTitle: 'LIVE4K' },
  // { channel: 106, channelTitle: 'LIVE4K2' },
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
      channels: [
        {
          channel: { type: Number, required: true },
          minor: { type: Number, required: false },
        },
      ],
    },
    {
      timestamps: true,
    },
  );
}

module.exports.health = async event => {
  return respond(200, `${process.env.serviceName}: i\'m good (table: ${process.env.tableProgram})`);
};

module.exports.createArea = async event => {
  const { zip, channels } = getBody(event);
  init();
  const programArea = await ProgramArea.create({ zip, channels });
  return respond(200, programArea);
};

module.exports.getAll = async event => {
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
  // if (location.channels && location.channels.local) {
  //   for (let i = 0; i < location.channels.local.length; i++) {
  //     location.channels.local[i] = parseInt(location.channels.local[i].replace(/-.*$/, ''));
  //   }
  // }
  // if (location.channels && location.channels.premium) {
  //   for (let i = 0; i < location.channels.premium.length; i++) {
  //     location.channels.premium[i] = parseInt(location.channels.premium[i].replace(/-.*$/, ''));
  //   }
  // }
  // console.log(JSON.stringify(location));
  // run in parallel
  // [currentNational, nextNational, currentPremium, nextPremium, currentLocal, nextLocal] = await Promise.all([

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
  // premium national
  // if (location.channels && location.channels.premium) {
  //   programs.push(
  //     Program.scan()
  //       .filter('start')
  //       .lt(now)
  //       .and()
  //       .filter('end')
  //       .gt(now)
  //       // .and()
  //       // .filter('mainCategory')
  //       // .eq('Sports')
  //       .and()
  //       .filter('channel')
  //       .in(location.channels.premium)
  //       .all()
  //       .exec(),
  //   );
  // }
  // local
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
        // .and()
        // .filter('mainCategory')
        // .eq('Sports')
        // .and()
        // .filter('channel')
        // .in(location.channels.local)
        .all()
        .exec(),
    );
  }

  let programsResult = await Promise.all(programs);
  programsResult = Array.prototype.concat.apply([], programsResult);

  console.log('programsResult', programsResult.length);

  // [currentNational, currentLocal] = await Promise.all([
  //   // find all national (no zip)
  //   Program.scan()
  //     .filter('start')
  //     .lt(now)
  //     .and()
  //     .filter('end')
  //     .gt(now)
  //     .and()
  //     .filter('zip')
  //     .null()
  //     .all()
  //     .exec(),
  //   // Program.scan()
  //   //   .filter('start')
  //   //   .lt(in25Mins)
  //   //   .and()
  //   //   .filter('end')
  //   //   .gt(in25Mins)
  //   //   .and()
  //   //   .filter('zip')
  //   //   .null()
  //   //   .all()
  //   //   .exec(),

  //   // find all premium (no zip)
  //   // Program.scan()
  //   //   .filter('start')
  //   //   .lt(now)
  //   //   .and()
  //   //   .filter('end')
  //   //   .gt(now)
  //   //   .and()
  //   //   .filter('channel')
  //   //   .in(location.channels.premium)
  //   //   .all()
  //   //   .exec(),
  //   // Program.scan()
  //   //   .filter('start')
  //   //   .lt(in25Mins)
  //   //   .and()
  //   //   .filter('end')
  //   //   .gt(in25Mins)
  //   //   .and()
  //   //   .filter('channel')
  //   //   .in(location.channels.premium)
  //   //   .all()
  //   //   .exec(),

  //   // find all local (with zip)
  //   Program.scan()
  //     .filter('start')
  //     .lt(now)
  //     .and()
  //     .filter('end')
  //     .gt(now)
  //     .and()
  //     .filter('channel')
  //     .in(location.channels.local)
  //     .and()
  //     .filter('zip')
  //     .eq(location.zip)
  //     .filter('mainCategory')
  //     .eq('Sports')
  //     .all()
  //     .exec(),
  //   // Program.scan()
  //   //   .filter('start')
  //   //   .lt(in25Mins)
  //   //   .and()
  //   //   .filter('end')
  //   //   .gt(in25Mins)
  //   //   .and()
  //   //   .filter('channel')
  //   //   .in(location.channels.local)
  //   //   .and()
  //   //   .filter('zip')
  //   //   .eq(location.zip)
  //   //   .filter('mainCategory')
  //   //   .eq('Sports')
  //   //   .all()
  //   //   .exec(),
  // ]);
  console.timeEnd('current + next Programming');
  // console.log({ currentProgramming });
  // console.log({ nextProgramming });

  // console.time('nextProgramming');
  // const nextProgramming =
  // console.timeEnd('nextProgramming');

  // console.time('nextProgram');
  // // add in next program if within 15 mins
  // initialChannels.forEach((p, index, arr) => {
  //   // find if in current programming
  //   const currentProgram = currentProgramming.find(cp => cp.channel === p.channel);
  //   // program may not be in guide yet
  //   if (currentProgram) {
  //     // keep minor channel if has one
  //     currentProgram.channelMinor = p.channelMinor;

  //     // find if in next programming
  //     const nextProgram = nextProgramming.find(np => np.channel === p.channel);

  //     // if next program is not the same as current one
  //     if (currentProgram && nextProgram && nextProgram.programId !== currentProgram.programId) {
  //       currentProgram.nextProgramTitle = nextProgram.title;
  //       currentProgram.nextProgramStart = nextProgram.start;
  //     }
  //     if (currentProgram) {
  //       arr[index] = currentProgram;
  //     }
  //   }
  // });
  // console.timeEnd('nextProgram');

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

module.exports.syncNew = async event => {
  try {
    init();

    // sync national channels
    const channels = nationalChannels.map(c => c.channel).join(',');
    await syncChannels(channels, null, nationalChannels);

    // sync local channels
    // const locationsResult = await invokeFunctionSync(
    //   `location-${process.env.stage}-getLocalChannels`,
    //   null,
    //   null,
    //   event.headers,
    // );
    // const locationResultBody = JSON.parse(JSON.parse(locationsResult.Payload).body);
    // const locationResultBody = locationsResult.data;
    const programAreas = ProgramArea.scan()
      .all()
      .exec();
    // for (const [zip, localChannels] of Object.entries(locationResultBody)) {
    for (const area of programAreas) {
      console.log('localChannels', localChannels);
      // let strippedChannels = localChannels.slice(0);
      // // replace dash, if there is one
      // for (let i = 0; i < strippedChannels.length; i++) {
      //   strippedChannels[i] = strippedChannels[i].replace(/-.*$/, '');
      // }
      // const strippedChannelsString = strippedChannels.join(',');
      const strippedChannels = getAreaChannels(area.channels);
      const strippedChannelsString = strippedChannels.join(',');
      await syncChannels(strippedChannelsString, zip, transformChannels(localChannels));
    }

    return respond(201, { count: locationsResult.length + 1 });
  } catch (e) {
    console.error(e);
    return respond(400, `Could not create: ${e.stack}`);
  }
};

async function syncChannels(channelsString, zip, channels) {
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
  let allPrograms = build(schedule, zip, channels);
  let transformedPrograms = transformPrograms(allPrograms);
  let dbResult = await Program.batchPut(transformedPrograms);
}

module.exports.syncDescriptions = async event => {
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

function transformPrograms(programs) {
  const transformedPrograms = [];
  programs.forEach(p => {
    transformedPrograms.push(new Program(p));
  });
  return transformedPrograms;
}

function build(dtvSchedule, zip, channels) {
  // pass in channels array (channel, channelMinor) so that we can include the minor number, if needed
  const programs = [];
  dtvSchedule.forEach(channel => {
    channel.schedules.forEach(program => {
      program.programId = program.programID;
      if (program.programId !== '-1') {
        program.channel = channel.chNum;
        program.channelTitle = getLocalChannelName(channel.chName) || channel.chCall;

        const channelWithMinor = channels.find(c => c.channel === program.channel);
        // console.log(channelWithMinor, program.channel);
        if (channelWithMinor) {
          program.channelMinor = channelWithMinor.channelMinor;
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

function generateId(program) {
  const { programId, zip } = program;
  const id = programId + (zip || '');
  // console.log(id, uuid.DNS);
  return uuid(id, uuid.DNS);
}

function getLocalChannelName(chName) {
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

function getAreaChannels(channels, includeMinor) {
  if (includeMinor) {
    return channels.map(obj => {
      let channelString = obj.channel.toString();
      if (obj.minor) {
        channelString = channelString.concat(`-${obj.minor}`);
      }
      return channelString;
    });
  }
  return channels.map(obj => obj.channel.toString());
}

module.exports.build = build;
module.exports.generateId = generateId;
module.exports.getLocalChannelName = getLocalChannelName;
module.exports.getAreaChannels = getAreaChannels;
