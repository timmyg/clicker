// @flow
const dynamoose = require('dynamoose');
const AWS = require('aws-sdk');
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
const { respond, getPathParameters, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const directvEndpoint = 'https://www.directv.com/json';
let Program, ProgramArea;

declare class process {
  static env: {
    tableProgram: string,
    serviceName: string,
    tableProgram: string,
    tableProgramArea: string,
    stage: string,
    newProgramTopicArn: string,
  };
}

type region = {
  name: string,
  defaultZip: string,
  localChannels: number[],
};

const allRegions: region[] = [{ name: 'cincinnati', defaultZip: '45202', localChannels: [5, 9, 12, 19, 661] }];
const minorChannels: number[] = [661];
const nationalExcludedChannels: string[] = ['MLBaHD', 'MLB'];
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
  218, //GOLF
  602, //TVG
  612, //ACCN
  618, //FS2
  620, //beIn Sports
  610, //BTN
  611, //SECHD
  605, //SPMN
  606, //OTDR
  221, //CBSSN // premium
  245, //TNT
  247, //TBS
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

function init() {
  Program = dynamoose.model(
    process.env.tableProgram,
    {
      region: {
        type: String,
        hashKey: true,
      },
      id: { type: String, rangeKey: true },
      start: { type: Number, index: true },
      end: { type: Number, index: true },
      channel: Number,
      channelMinor: Number,
      channelTitle: String,
      title: String, // "Oklahoma State @ Kansas"
      episodeTitle: String, // "Oklahoma State at Kansas"
      description: String,
      durationMins: Number, // mins
      live: Boolean,
      repeat: Boolean,
      sports: Boolean,
      programmingId: String, // "SH000296530000" - use this to get summary
      channelCategories: [String], // ["Sports Channels"]
      subcategories: [String], // ["Basketball"]
      mainCategory: String, // "Sports"
      // dynamic fields
      nextProgramTitle: String,
      nextProgramStart: Number,
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
  // ProgramArea = dynamoose.model(
  //   process.env.tableProgramArea,
  //   {
  //     zip: {
  //       type: String,
  //       hashKey: true,
  //     },
  //     channels: [Number],
  //   },
  //   {
  //     timestamps: true,
  //   },
  // );
}

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('hi', process.env.tableProgram);
  return respond(200, `${process.env.serviceName}: i\'m flow good (table: ${process.env.tableProgram})`);
});

module.exports.getAll = RavenLambdaWrapper.handler(Raven, async event => {
  const params = getPathParameters(event);
  const { locationId } = params;

  console.log({ locationId });
  const { data: location } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: locationId })
    .headers(event.headers)
    .go();

  init();
  const initialChannels = nationalChannels;
  // get all programs for right now
  const now = moment().unix() * 1000;
  const in25Mins =
    moment()
      .add(25, 'minutes')
      .unix() * 1000;

  console.time('current + next programming setup queries');

  const programsQuery = Program.query()
    .filter('start')
    .lt(now)
    .and()
    .filter('end')
    .gt(now)
    .and()
    .filter('region')
    .eq(location.region)
    .all()
    .exec();

  const programsNextQuery = Program.query()
    .filter('start')
    .lt(in25Mins)
    .and()
    .filter('end')
    .gt(in25Mins)
    .and()
    .filter('region')
    .eq(location.region)
    .all()
    .exec();
  console.timeEnd('current + next programming setup queries');

  console.time('current + next programming run query');
  const [programs, programsNext] = await Promise.all([programsQuery, programsNextQuery]);
  console.time('current + next programming run query');

  let currentPrograms = programs;
  const nextPrograms = programsNext;

  console.time('current + next programming combine');
  currentPrograms.forEach((program, i) => {
    const nextProgram = nextPrograms.find(
      np => np.channel === program.channel && np.programmingId !== program.programmingId,
    );
    if (nextProgram) {
      currentPrograms[i].nextProgramTitle = nextProgram.title;
      currentPrograms[i].nextProgramStart = nextProgram.start;
    }
  });
  console.time('current + next programming combine');

  console.time('remove excluded');
  console.log('exclude', location.channels);
  if (location.channels && location.channels.exclude) {
    const excludedChannels = location.channels.exclude.map(function(item) {
      return parseInt(item, 10);
    });
    console.log(excludedChannels);
    // console.log(currentPrograms.length);
    currentPrograms = currentPrograms.filter(p => !excludedChannels.includes(p.channel));
    console.log(currentPrograms.length);
  }
  console.timeEnd('remove excluded');

  console.time('rank');
  const rankedPrograms = rankPrograms(currentPrograms);
  // const rankedPrograms = rankPrograms(currentNational.concat(currentPremium, currentLocal));
  console.timeEnd('rank');
  return respond(200, rankedPrograms);
});

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

module.exports.syncNew = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    init();

    for (const region of allRegions) {
      const { defaultZip, name, localChannels } = region;
      console.log(`sync local channels: ${name}/${defaultZip} for channels ${localChannels.join(', ')}`);
      await new Invoke()
        .service('programs')
        .name('syncByRegion')
        .body({ name, localChannels, defaultZip })
        .async()
        .go();
    }
    return respond(201);
  } catch (e) {
    console.error(e);
    return respond(400, `Could not create: ${e.stack}`);
  }
});

module.exports.syncByRegion = RavenLambdaWrapper.handler(Raven, async event => {
  const { name, defaultZip, localChannels } = getBody(event);
  await syncChannels(name, localChannels, defaultZip);
  respond(200);
});

async function syncChannels(regionName: string, regionChannels: number[], zip: string) {
  init();
  // channels may have minor channel, so get main channel number
  const channels = nationalChannels.concat(regionChannels);
  const channelsString = getChannels(channels).join(',');

  // get latest program
  const latestProgram = await Program.queryOne('region')
    .eq(regionName)
    .where('start')
    .descending()
    .exec();

  console.log({ latestProgram });

  let totalHours, startTime;
  // if programs, take the largest start time, add 1 minutes and start from there and get two hours of programming
  if (latestProgram) {
    startTime = moment(latestProgram.start)
      .utc()
      .add(1, 'minute')
      .toString();
    totalHours = 2;
  } else {
    // if no programs, get 4 hours ago and pull 6 hours
    const startHoursFromNow = -4;
    totalHours = 6;
    startTime = moment()
      .utc()
      .add(startHoursFromNow, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
  }

  const url = `${directvEndpoint}/channelschedule`;

  const params = { channels: channelsString, startTime, hours: totalHours };
  const headers = {
    Cookie: `dtve-prospect-zip=${zip};`,
  };
  const method = 'get';
  console.log('getting channels....', params, headers);
  let result = await axios({ method, url, params, headers });

  let { schedule } = result.data;
  let allPrograms = build(schedule, regionName);
  let transformedPrograms = buildProgramObjects(allPrograms);
  console.log(transformedPrograms);
  let dbResult = await Program.batchPut(transformedPrograms);

  // get program ids, publish to sns topic to update description
  const sns = new AWS.SNS({ region: 'us-east-1' });
  for (const program of transformedPrograms) {
    const messageData = {
      Message: JSON.stringify(program),
      TopicArn: process.env.newProgramTopicArn,
    };

    try {
      console.log('publish', process.env.newProgramTopicArn);
      await sns.publish(messageData).promise();
    } catch (e) {
      console.error(e);
    }
  }
}

// module.exports.consumeNewProgramFunction = RavenLambdaWrapper.handler(Raven, async event => {
//   init();
//   // console.log(event.Records[0].Sns.Message);
//   const { id, programmingId, start } = JSON.parse(event.Records[0].Sns.Message);
//   const url = `${directvEndpoint}/program/flip/${programmingId}`;
//   const options = {
//     timeout: 2000,
//   };
//   try {
//     console.log({ url }, { options });
//     console.log('calling');
//     const result = await axios.get(url, options);
//     console.log('result');

//     const { description } = result.data.programDetail;

//     console.log('update', { id }, { description });
//     const response = await Program.update({ id, start }, { description });
//     // await User.update({ id: userId }, { referralCode }, { returnValues: 'ALL_NEW' });
//     console.log({ response });
//   } catch (e) {
//     if (e.response && e.response.status === 404) {
//       console.log('404!!');
//       return console.error(e);
//     }
//     console.error(e);
//     throw e;
//   }
// });

module.exports.consumeNewProgram = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('consume');
  console.log(event);
  init();
  const { id, programmingId, region } = JSON.parse(event.Records[0].body);
  const url = `${directvEndpoint}/program/flip/${programmingId}`;
  const options = {
    timeout: 2000,
  };
  try {
    const result = await axios.get(url, options);
    console.log('result.data.programDetail', result.data.programDetail);
    const { description } = result.data.programDetail;
    console.log('update', { id, region }, { description });

    // let program = await getProgram(id, region);
    // if (!!program.id) {
    await updateProgram(id, region, description);
    //   console.log('program saved');
    // } else {
    //   console.log('no program by id:', id);
    // }
    return respond(200);
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.log('404!!');
      console.error(e);
      return respond(200);
    }
    console.error(e);
    throw e.response;
  }
});

// async function updateProgram(data) {
//   const AWS = require('aws-sdk');
//   const docClient = new AWS.DynamoDB.DocumentClient();
//   var params = {
//     TableName: process.env.tableProgram,
//     Item: data,
//   };
//   try {
//     console.log('. . .');
//     const x = await docClient.put(params).promise();
//     console.log({ x });
//   } catch (err) {
//     return err;
//   }
// }
// async function abstraction
async function updateProgram(id, region, description) {
  console.log({ description });
  const AWS = require('aws-sdk');
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: process.env.tableProgram,
    Key: { id, region },
    UpdateExpression: 'set description = :newdescription',
    ConditionExpression: 'id = :id',
    ExpressionAttributeValues: { ':newdescription': description, ':id': id },
  };
  try {
    const x = await docClient.update(params).promise();
    console.log({ x });
  } catch (err) {
    console.log({ err });
    return err;
  }
}

// async function getProgram(id, start) {
//   const AWS = require('aws-sdk');
//   const docClient = new AWS.DynamoDB.DocumentClient();
//   var params = {
//     TableName: process.env.tableProgram,
//     Key: { id, start },
//   };
//   try {
//     const data = await docClient.get(params).promise();
//     return data.Item;
//   } catch (err) {
//     return err;
//   }
// }

function buildProgramObjects(programs) {
  const transformedPrograms = [];
  programs.forEach(p => {
    transformedPrograms.push(new Program(p));
  });
  return transformedPrograms;
}

function build(dtvSchedule: any, regionName: string) {
  // pass in channels array (channel, channelMinor) so that we can include the minor number, if needed
  const programs = [];
  dtvSchedule.forEach(channel => {
    channel.schedules.forEach(program => {
      program.programmingId = program.programID;
      if (program.programmingId !== '-1' && !nationalExcludedChannels.includes(channel.chCall)) {
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
        program.region = regionName;
        program.id = generateId(program);
        program.start = moment(program.airTime).unix() * 1000;
        program.end =
          moment(program.airTime)
            .add(program.durationMins, 'minutes')
            .unix() * 1000;
        programs.push(program);
      }
    });
  });
  // filter out duplicates - happens with sd/hd channels
  const filteredPrograms = uniqBy(programs, 'id');
  return filteredPrograms;
}

function generateId(program: any) {
  const { programmingId, region } = program;
  const id = programmingId + region;
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

module.exports.build = build;
module.exports.generateId = generateId;
module.exports.getLocalChannelName = getLocalChannelName;
module.exports.getChannels = getChannels;
