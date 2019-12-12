// @flow
const dynamoose = require('dynamoose');
const Airtable = require('airtable');
let AWS;
if (!process.env.IS_LOCAL) {
  AWS = require('aws-xray-sdk').captureAWS(require('aws-sdk'));
} else {
  console.info('Serverless Offline detected; skipping AWS X-Ray setup');
  AWS = require('aws-sdk');
}
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
const { respond, getPathParameters, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const directvEndpoint = 'https://www.directv.com/json';

declare class process {
  static env: {
    airtableBase: string,
    airtableKey: string,
    tableProgram: string,
    serviceName: string,
    tableProgram: string,
    stage: string,
    newProgramTopicArn: string,
    NODE_ENV: string,
    IS_LOCAL: string,
  };
}

type region = {
  name: string,
  defaultZip: string,
  localChannels: number[],
};

const allRegions: region[] = [
  { name: 'cincinnati', defaultZip: '45202', localChannels: [5, 9, 12, 19, 661] },
  { name: 'chicago', defaultZip: '60613', localChannels: [2, 5, 7, 32] },
  { name: 'nyc', defaultZip: '10004', localChannels: [2, 4, 5, 7] },
];
const minorChannels: number[] = [661];
const nationalExcludedChannels: string[] = ['MLBaHD', 'MLB', 'INFO'];
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

if (process.env.NODE_ENV === 'test') {
  dynamoose.AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'test',
  });
}
const dbProgram = dynamoose.model(
  process.env.tableProgram,
  {
    region: {
      type: String,
      hashKey: true,
      index: true,
    },
    id: { type: String, rangeKey: true },
    start: { type: Number, rangeKey: true },
    end: Number,
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

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('hi', process.env.tableProgram, process.env);
  return respond(200, `${process.env.serviceName}: i\'m flow good (table: ${process.env.tableProgram})`);
});

module.exports.getAll = RavenLambdaWrapper.handler(Raven, async event => {
  const params = getPathParameters(event);
  const { locationId } = params;

  console.log({ locationId });
  const { data: location }: { data: Venue } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: locationId })
    .headers(event.headers)
    .go();

  const initialChannels = nationalChannels;
  // get all programs for right now
  const now = moment().unix() * 1000;
  const in25Mins =
    moment()
      .add(25, 'minutes')
      .unix() * 1000;

  console.time('current + next programming setup queries');

  console.log(location.region, now, in25Mins);
  const programsQuery = dbProgram
    .query('region')
    .eq(location.region)
    .and()
    .filter('start')
    .lt(now)
    .and()
    .filter('end')
    .gt(now)
    .all()
    .exec();
  console.log(2);

  const programsNextQuery = dbProgram
    .query('region')
    .eq(location.region)
    .and()
    .filter('end')
    .gt(in25Mins)
    .and()
    .filter('start')
    .lt(in25Mins)
    .all()
    .exec();
  console.log(3);
  console.timeEnd('current + next programming setup queries');

  console.time('current + next programming run query');
  const [programs: Program[], programsNext: Program[]] = await Promise.all([programsQuery, programsNextQuery]);
  console.log(programs.length, programsNext.length);
  console.time('current + next programming run query');

  let currentPrograms: Program[] = programs;
  const nextPrograms: Program[] = programsNext;

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
  const rankedPrograms: Program[] = rankPrograms(currentPrograms);
  // const rankedPrograms = rankPrograms(currentNational.concat(currentPremium, currentLocal));
  console.timeEnd('rank');
  return respond(200, rankedPrograms);
});

function rankPrograms(programs: Program[]) {
  programs.forEach((program, i) => {
    programs[i] = rank(program);
  });
  return programs.sort((a, b) => b.points - a.points);
}

function rank(program: Program) {
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
    for (const region of allRegions) {
      const { defaultZip, name, localChannels } = region;
      console.log(`sync local channels: ${name}/${defaultZip} for channels ${localChannels.join(', ')}`);
      await new Invoke()
        .service('program')
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
  console.log(JSON.stringify(event));
  const { name, defaultZip, localChannels } = getBody(event);
  await syncChannels(name, localChannels, defaultZip);
  respond(200);
});

async function syncChannels(regionName: string, regionChannels: number[], zip: string) {
  // channels may have minor channel, so get main channel number
  const channels = regionChannels.concat(nationalChannels);
  const channelsString = getChannels(channels).join(',');

  // get latest program
  console.log('querying region:', regionName);
  // const regionPrograms = await dbProgram.query('region').eq(regionName).exec();
  const regionPrograms = await dbProgram
    .query('region')
    .using('startLocalIndex')
    .eq(regionName)
    .where('start')
    .descending()
    .exec();
  console.log('regionPrograms:', regionPrograms.length);
  const existingRegionProgramIds = regionPrograms.map(p => p.id);

  // console.log({ regionName, latestProgram });

  let totalHours, startTime;
  // if programs, take the largest start time, add 1 minute and start from there and get two hours of programming
  //   add one hour because that seems like min duration for dtv api
  //   (doesnt matter if you set to 5:00 or 5:59, same results until 6:00)
  if (regionPrograms && regionPrograms.length) {
    startTime = moment(regionPrograms[0].start)
      .utc()
      .add(1, 'hour')
      .toString();
    totalHours = 2;
  } else {
    // if no programs, get 4 hours ago and pull 6 hours
    const startHoursFromNow = -4;
    totalHours = 8;
    startTime = moment()
      .utc()
      .add(startHoursFromNow, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
  }

  const url = `${directvEndpoint}/channelschedule`;

  const params = { startTime, hours: totalHours, channels: channelsString };
  const headers = {
    Cookie: `dtve-prospect-zip=${zip};`,
  };
  const method = 'get';
  console.log('getting channels....', params, headers);
  let result = await axios({ method, url, params, headers });
  // console.log(result);
  let { schedule } = result.data;
  let allPrograms: Program[] = build(schedule, regionName);
  // deduplicate
  console.log('allPrograms:', allPrograms.length);
  allPrograms = allPrograms.filter(p => !existingRegionProgramIds.includes(p.id));
  console.log('allPrograms deduped:', allPrograms.length);
  let transformedPrograms = buildProgramObjects(allPrograms);
  console.log('transformedPrograms', transformedPrograms.length);
  let dbResult = await dbProgram.batchPut(transformedPrograms);
  console.log(dbResult);

  // get program ids, publish to sns topic to update description
  const sns = new AWS.SNS({ region: 'us-east-1' });
  let i = 0;
  const messagePromises = [];
  console.time(`publish ${transformedPrograms.length} messages`);
  for (const program of transformedPrograms) {
    console.log(i);
    const messageData = {
      Message: JSON.stringify(program),
      TopicArn: process.env.newProgramTopicArn,
    };

    try {
      messagePromises.push(sns.publish(messageData).promise());
      i++;
    } catch (e) {
      console.error(e);
    }
  }
  await Promise.all(messagePromises);
  console.timeEnd(`publish ${transformedPrograms.length} messages`);
  console.log(i, 'topics published to:', process.env.newProgramTopicArn);
}

module.exports.consumeNewProgramUpdateDescription = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('consume');
  console.log(event);
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

    if (description && description.length) {
      // update in our db
      await updateProgram(id, region, description);
      // update in airtable
      const airtableBase = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
      const airtablePrograms = 'Programs';
      const airtableGames = await airtableBase(airtablePrograms)
        .select({
          filterByFormula: `{programmingId} = ${programmingId}`,
        })
        .all();
      const airtablePromises = [];
      airtableGames.forEach(g => {
        airtablePromises.push(
          airtableBase(airtablePrograms).update(g.id, {
            description,
          }),
        );
      });
      await Promise.all(airtablePromises);
    }
    return respond(200);
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.log('404!!');
      console.error(e);
    }
    console.error(e);
    return respond(400);
  }
});
module.exports.consumeNewProgramAddToAirtable = RavenLambdaWrapper.handler(Raven, async event => {
  const airtableBase = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtablePrograms = 'Programs';
  console.log('consume');
  console.log(event);
  const program: Program = JSON.parse(event.Records[0].body);
  const { programmingId, title, description, channel, channelTitle, live, start } = program;

  await airtableBase(airtablePrograms).create({
    programmingId,
    title,
    description,
    channel,
    channelTitle,
    live,
    start,
  });

  console.log({ program });
  return respond(200);
});

async function updateProgram(id, region, description) {
  console.log({ description });
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

function buildProgramObjects(programs) {
  const transformedPrograms = [];
  programs.forEach(p => {
    transformedPrograms.push(new dbProgram(p));
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
