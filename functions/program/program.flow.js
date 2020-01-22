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
    newProgramTopicArn: string,
    newProgramAirtableTopicArn: string,
    tableProgram: string,
    stage: string,
    syncProgramsAirtableDateTopicArn: string,
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
  { name: 'cincinnati', defaultZip: '45202', localChannels: [5, 9, 12, 19, 661, 660] },
  { name: 'chicago', defaultZip: '60613', localChannels: [2, 5, 7, 32] },
  { name: 'nyc', defaultZip: '10004', localChannels: [2, 4, 5, 7] },
];
// const minorChannels: number[] = [661];
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
  // 620, //beIn Sports
  610, //BTN
  611, //SECHD
  605, //SPMN
  606, //OTDR
  221, //CBSSN // premium
  245, //TNT
  247, //TBS
  // 701, //NFLMX // 4 game mix
  // 702, //NFLMX // 8 game mix
  // 703, //NFLRZ // Redzone (premium)
  // 704, //NFLFAN // Fantasy Zone (premium)
  // 705, //NFL
  // 706, //NFL
  // 707, //NFL
  // 708, //NFL
  // 709, //NFL
  // 710, //NFL
  // 711, //NFL
  // 712, //NFL
  // 713, //NFL
  // 714, //NFL
  // 715, //NFL
  // 716, //NFL
  // 717, //NFL
  // 718, //NFL
  // 719, //NFL
];

// 2661
const minorChannels = [
  {
    channel: 660,
    subChannels: [
      {
        minor: 1,
        channelIds: [5660, 2660],
      },
      { minor: 2, channelIds: [623, 624] },
    ],
  },
  {
    channel: 661,
    subChannels: [
      {
        minor: 1,
        channelIds: [5661],
      },
      { minor: 2, channelIds: [625, 376] },
    ],
  },
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
    start: { type: Number },
    end: Number,
    channel: {
      type: Number,
      index: {
        global: true,
        project: true,
        // project: [
        //   'start',
        //   'end',
        //   'region',
        //   'gameId',
        //   'game',
        //   // 'programmingId'
        // ],
      },
    },
    channelMinor: Number,
    channelTitle: String,
    title: String, // "Oklahoma State @ Kansas"
    episodeTitle: String, // "Oklahoma State at Kansas"
    description: String,
    durationMins: Number, // mins
    gameId: {
      type: Number,
      index: {
        global: true,
        // name: 'idOnlyGlobalIndex',
        project: false,
      },
    },
    // game: saveUnknown below
    clickerRating: Number,
    live: Boolean,
    repeat: Boolean,
    sports: Boolean,
    programmingId: {
      type: String,
      index: {
        global: true,
        // name: 'idOnlyGlobalIndex',
        project: false,
      },
    }, // "SH000296530000" - use this to get summary
    channelCategories: [String], // ["Sports Channels"]
    subcategories: [String], // ["Basketball"]
    mainCategory: String, // "Sports"
    programType: String, // "Sports non-event"
    // dynamic fields
    nextProgramTitle: String,
    nextProgramStart: Number,
    points: Number,
    synced: Boolean, // synced with description from separate endpoint
  },
  {
    saveUnknown: ['game'],
    timestamps: true,
    expires: {
      ttl: 86400,
      attribute: 'expires',
      returnExpiredItems: false,
      defaultExpires: x => {
        // expire 2 hours after end
        return moment(x.end)
          .add(2, 'hours')
          .toDate();
      },
    },
  },
);

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `${process.env.serviceName}: i\'m flow good (table: ${process.env.tableProgram})`);
  // const x = await getProgramDetails({ programmingId: 'SH003895120000' });
  // console.log({ x });
});

// module.exports.getScheduleTest = RavenLambdaWrapper.handler(Raven, async event => {
//   const url = `https://www.directv.com/json/channelschedule`;
//   const channelsString = [9, 206].join(',');
//   const params = { startTime: 'Fri Dec 20 2019 10:00:00 GMT+0000', hours: 8, channels: channelsString };
//   const headers = {
//     Cookie: `dtve-prospect-zip=45212; TLTSID=07AB36D2984D10980006B9E2CD812DCD; TLTUID=07AB36D2984D10980006B9E2CD812DCD; dtv-lsid=cjxaz2wvrtrfzlhqxez7ebw3k; customer=yes; dtv-msg-key-cache=f2f4b6987855de75fb25f643800680fe9e3b7e71; AB_IDPROOT=new_idproot_20190410; ak_bmsc=BF3F5616F70B1D3EBCBB8528B9CF0AC5B81B2D9AA23E0000DA20FD5DF346D533~plhd0d9XqziHqQPQJ6Ono9r+jJYoytwdXPspAQvp216SDIBxPPpDVoOZVge2RFIS6JGjilwgnRukLLcw64Wasa3T3osFoGU1wcSl17r1ApQ2vJvahtErciLCUS0kA3Y8fC7CgGHaFMfTr5kvWaHUea3s6xCQti+OQtD6mWyOroIaYJi/CRqhWHeCIvLhtnYFQstHDAW2XMgvW6Dlnq09TMcd1N1tMk+dZSe60dGkoA9fg=`,
//   };
//   const method = 'get';
//   // const timeout = 2000;
//   console.log('getting channels....', params, headers);
//   console.log('calling...');
//   const result = await axios({
//     method,
//     url,
//     params,
//     headers,
//   });
//   console.log('back!', result);
//   return respond(200, result);
// });

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('GET');
  // console.log(event.queryStringParameters);
  const previousProgramMinutesAgo = 90;
  const { channel, time, region, programmingId, programmingIds } = event.queryStringParameters;
  if (!region) {
    return respond(400, `need region: ${region}`);
  }
  if (!channel && !programmingId && !programmingIds) {
    return respond(
      400,
      `need channel/programmingId/programmingIds: ${JSON.stringify({ channel, programmingId, programmingIds })}`,
    );
  }
  if (channel) {
    const timeToSearch = time || moment().unix() * 1000;
    const timeToSearchPreviousProgram =
      moment(timeToSearch)
        .subtract(previousProgramMinutesAgo, 'm')
        .unix() * 1000;
    // get programs that are on now or ended within last 30 mins
    const programs: Program[] = await dbProgram
      .query('channel')
      .eq(channel)
      .and()
      .filter('region')
      .eq(region)
      .and()
      .filter('start')
      .lt(timeToSearch)
      .and()
      .filter('end')
      .gt(timeToSearchPreviousProgram)
      .exec();

    // this was causing issues getting location (location.boxes.program.subcategories) when it was empty
    programs.forEach(p => {
      delete p.subcategories;
      delete p.channelCategories;
    });
    console.log(`programs: ${programs.length}`);
    const sortedPrograms = programs.sort((a, b) => a.createdAt - b.createdAt);
    const existingProgram = sortedPrograms[sortedPrograms.length - 1];
    if (sortedPrograms.length > 1) {
      // check if first program is game, and if it is over
      const previousProgram = sortedPrograms[0];
      console.log({ previousProgram });
      if (previousProgram.game && previousProgram.game.status === 'inprogress') {
        return respond(200, previousProgram);
      }
    } else if (
      existingProgram &&
      (moment(existingProgram.start).diff(moment()) > 0 || moment(existingProgram.end).diff(moment()) < 0)
    ) {
      console.info('no current program');
      return respond(200, {});
    }
    return respond(200, existingProgram);
  } else if (programmingId) {
    console.log({ programmingId });
    const programs: Program[] = await dbProgram
      .query('region')
      .eq(region)
      .and()
      .filter('programmingId')
      .eq(programmingId)
      .exec();
    // TODO what if program on multiple channels? choose local?
    const sortedPrograms = programs.sort((a, b) => a.start - b.start);
    return respond(200, sortedPrograms[0]);
  } else if (programmingIds) {
    const programs: Program[] = await dbProgram
      .query('region')
      .eq(region)
      .and()
      .filter('programmingId')
      .in(programmingIds)
      // .in(['EP023034511512'])
      .exec();
    const sortedPrograms = programs.sort((a, b) => a.start - b.start);
    return respond(200, sortedPrograms);
  }
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

module.exports.syncRegions = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    for (const region of allRegions) {
      const { defaultZip, name, localChannels } = region;
      console.log(`sync local channels: ${name}/${defaultZip} for channels ${localChannels.join(', ')}`);
      await new Invoke()
        .service('program')
        .name('syncRegionNextFewHours')
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

module.exports.syncRegionNextFewHours = RavenLambdaWrapper.handler(Raven, async event => {
  console.log(JSON.stringify(event));
  const { name: regionName, defaultZip, localChannels } = getBody(event);
  await syncRegionChannels(regionName, localChannels, defaultZip);
  respond(200);
});

// npm run invoke:syncAirtable
module.exports.syncAirtable = RavenLambdaWrapper.handler(Raven, async event => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtablePrograms = 'Control Center';
  const datesToPull = [];
  const daysToPull = 8;
  [...Array(daysToPull)].forEach((_, i) => {
    const dateToSync = moment()
      .subtract(5, 'hrs')
      .add(i, 'days')
      .toDate();
    datesToPull.push(dateToSync);
  });
  for (const region of allRegions) {
    const results = await pullFromDirecTV(region.name, region.localChannels, region.defaultZip, datesToPull, 24);
    // TODO:SENTRY results is not iterable
    for (const result of results) {
      const allExistingGames = await base(airtablePrograms)
        .select({ fields: ['programmingId'] })
        .all();
      const allExistingProgrammingIds = allExistingGames.map(g => g.get('programmingId'));
      const schedule = result.data;
      let allPrograms: Program[] = build(schedule, region.name);
      // allPrograms = allPrograms.filter(p => !!p.live);
      allPrograms = uniqBy(allPrograms, 'programmingId');
      allPrograms = allPrograms.filter(e => !allExistingProgrammingIds.includes(e.programmingId));
      let allAirtablePrograms = buildAirtablePrograms(allPrograms);
      console.time('create');
      while (!!allAirtablePrograms.length) {
        try {
          const promises = [];
          const programsSlice = allAirtablePrograms.splice(0, 10);
          console.log('batch putting:', programsSlice.length);
          console.log('remaining:', allAirtablePrograms.length);
          promises.push(base(airtablePrograms).create(programsSlice));
          await Promise.all(promises);
        } catch (e) {
          console.error(e);
        }
      }
      await publishNewPrograms(allPrograms, process.env.newProgramAirtableTopicArn);
      console.timeEnd('create');
    }
  }
  return respond(200);
});

async function getAirtableProgramsInWindow(hasGameAttached, hoursAgo = 4, hoursFromNow = 4) {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtableProgramsName = 'Control Center';
  const fourHoursAgo = moment()
    .subtract(hoursAgo, 'h')
    .toISOString();
  const fourHoursFromNow = moment()
    .add(hoursFromNow, 'h')
    .toISOString();

  let filterByFormula: string[] = [`{start} > '${fourHoursAgo}'`, `{start} < '${fourHoursFromNow}'`];
  if (hasGameAttached) {
    filterByFormula.push(`{rating} != BLANK()`);
  }
  const updatedAirtablePrograms = await base(airtableProgramsName)
    .select({
      filterByFormula: `AND(${filterByFormula.join(',')})`,
    })
    .all();
  return updatedAirtablePrograms;
}

module.exports.syncAirtableUpdates = RavenLambdaWrapper.handler(Raven, async event => {
  const updatedAirtablePrograms = await getAirtableProgramsInWindow(true);
  const promises = [];
  for (const airtableProgram of updatedAirtablePrograms) {
    const programmingId = airtableProgram.get('programmingId');
    const gameDatabaseId = airtableProgram.get('gameId') && airtableProgram.get('gameId')[0];
    const programRating = airtableProgram.get('rating');
    const programs = await dbProgram
      .query('programmingId')
      .eq(programmingId)
      .exec();

    for (const program of programs) {
      const { region, id } = program;
      console.log({ region, id }, { gameId: gameDatabaseId, clickerRating: programRating });
      promises.push(dbProgram.update({ region, id }, { gameId: gameDatabaseId, clickerRating: programRating }));
    }
  }
  await Promise.all(promises);

  return respond(200, { updates: promises.length });
});

class RatingKeywordsAirtable {
  terms: string;
  rating: number;
  fields: any;
  get(x: string): any {}
  //   split(x: string) {}
}

class ProgramAirtable {
  id: string;
  rating: number;
  title: string;
  get(x: string): any {}
}

// async function ratePrograms(programs: ProgramAirtable[]) {
//   const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
//   const airtableRatingKeywordsName = 'Rating Keywords';

//   const keywordRecords: RatingKeywordsAirtable[] = await base(airtableRatingKeywordsName)
//     .select({
//       view: 'Live',
//     })
//     .all();

//   const rated = [];
//   keywordRecords.forEach(kw => {
//     const termsList: any = kw.get('Terms');
//     const rating: number = kw.get('Rating');
//     const terms = termsList.split(',').map(item => item.trim());
//     terms.map(term => {
//       let isProperty = false;
//       if (term.startsWith('{')) {
//         isProperty = true;
//         term = term.replace(/{/g, '').replace(/}/g, '');
//       }
//       programs.forEach((p: any) => {
//         if (isProperty) {
//           console.log(term, p.get(term));
//           if (p.get(term) === true) {
//             p.set('rating', rating);
//             rated.push(p);
//           }
//         } else {
//           const titleHasTerm = p
//             .get('title')
//             .toLowerCase()
//             .includes(term);
//           if (titleHasTerm) {
//             if (!p.get('rating')) {
//               p.set('rating', rating);
//               rated.push(p);
//             }
//           }
//         }
//       });
//     });
//   });
//   return rated;
// }

function buildAirtablePrograms(programs: Program[]) {
  const transformed = [];
  programs.forEach(program => {
    const {
      programmingId,
      title,
      description,
      channel,
      channelMinor,
      region,
      channelTitle,
      live,
      start,
      end,
    } = program;
    transformed.push({
      fields: {
        programmingId,
        title,
        description,
        channel,
        channelMinor,
        region,
        channelTitle,
        live,
        start,
        end,
      },
    });
  });
  return transformed;
}

async function syncRegionChannels(regionName: string, regionChannels: number[], zip: string) {
  // channels may have minor channel, so get main channel number
  // const channels = [...regionChannels, ...nationalChannels];

  // get latest program
  console.log('querying region:', regionName);
  // const regionPrograms = await dbProgram.query('region').eq(regionName).exec();
  const existingRegionPrograms = await dbProgram
    .query('region')
    .using('startLocalIndex')
    .eq(regionName)
    .where('start')
    .descending()
    .exec();
  console.log('existingRegionPrograms:', existingRegionPrograms.length);
  const existingRegionProgramIds = existingRegionPrograms.map(p => p.id);
  let totalHours, startTime;
  // if programs, take the largest start time, add 1 minute and start from there and get two hours of programming
  //   add one hour because that seems like min duration for dtv api
  //   (doesnt matter if you set to 5:00 or 5:59, same results until 6:00)
  if (existingRegionPrograms && existingRegionPrograms.length) {
    startTime = moment(existingRegionPrograms[0].start)
      .utc()
      .add(1, 'hour');
    totalHours = 2;
  } else {
    // if no programs, get 4 hours ago and pull 8 hours
    const startHoursFromNow = -4;
    totalHours = 8;
    startTime = moment()
      .utc()
      .add(startHoursFromNow, 'hours')
      .minutes(0)
      .seconds(0);
  }
  const result = await pullFromDirecTV(regionName, regionChannels, zip, [startTime], totalHours);
  // TODO:SENTRY sometimes this is undefined
  console.log({ result });
  let schedule = result[0].data;
  let allPrograms: Program[] = build(schedule, regionName);
  // remove existing programs
  console.log('allPrograms:', allPrograms.length);
  allPrograms = allPrograms.filter(p => !existingRegionProgramIds.includes(p.id));
  console.log('allPrograms deduped:', allPrograms.length);
  allPrograms = uniqBy(allPrograms, 'programmingId');
  console.log('allPrograms new unique:', allPrograms.length);
  let transformedPrograms: Program[] = buildProgramObjects(allPrograms);
  console.log('transformedPrograms', transformedPrograms.length);
  let dbResult = await dbProgram.batchPut(transformedPrograms);
  await publishNewPrograms(transformedPrograms, process.env.newProgramTopicArn);
  console.log(dbResult);
}

async function publishNewPrograms(programs: Program[], topicArn: string) {
  const sns = new AWS.SNS({ region: 'us-east-1' });
  let i = 0;
  const messagePromises = [];
  console.time(`publish ${programs.length} messages`);
  for (const program of programs) {
    const messageData = {
      Message: JSON.stringify(program),
      TopicArn: topicArn,
    };

    try {
      if (!process.env.IS_LOCAL) {
        messagePromises.push(sns.publish(messageData).promise());
        i++;
      }
    } catch (e) {
      console.error(e);
    }
  }
  await Promise.all(messagePromises);
  console.timeEnd(`publish ${messagePromises.length} messages`);
  console.log(i, 'topics published to:', topicArn);
}

async function pullFromDirecTV(
  regionName: string,
  regionChannels: number[],
  zip: string,
  startTimes: moment[],
  totalHours,
): Promise<any> {
  const promises = [];
  startTimes.forEach(startTime => {
    const channelsString = getChannels([...regionChannels, ...nationalChannels]).join(',');
    promises.push(
      new Invoke()
        .service('program')
        .name('getSchedulePy')
        .queryParams({ start: startTime.toString(), zip, hours: totalHours, channels: channelsString })
        // .headers(event.headers)
        .go(),
    );
  });
  console.log(`executing ${promises.length} promises`);
  console.time('pullFromDirecTV');
  try {
    const results = await Promise.all(promises);
    console.log(results.length);
    console.timeEnd('pullFromDirecTV');
    return results;
  } catch (e) {
    console.error(e);
  }
}

async function getProgramDetails(program: Program): Promise<any> {
  console.log({ program });
  const { programmingId } = program;
  const result = await new Invoke()
    .service('program')
    .name('getProgramDetailPy')
    .queryParams({ programmingId })
    .go();
  return result ? result.data : null;
}

module.exports.consumeNewProgramAirtableUpdateDetails = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('consume');
  const program = JSON.parse(event.Records[0].body);
  const { id, programmingId, region } = program;
  console.time('programDetails');
  const programDetails = await getProgramDetails(program);
  console.timeEnd('programDetails');
  if (!!programDetails) {
    const { description, progType: programType } = programDetails;
    // update in airtable
    const airtableBase = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
    const airtablePrograms = 'Control Center';
    console.time('airtable');
    const airtableGames = await airtableBase(airtablePrograms)
      .select({
        filterByFormula: `{programmingId} = '${programmingId}'`,
      })
      .all();
    console.timeEnd('airtable');
    console.log({ airtableGames });
    const airtablePromises = [];
    airtableGames.forEach(g => {
      airtablePromises.push(
        airtableBase(airtablePrograms).update(g.id, {
          description,
          programType,
        }),
      );
    });
    console.log('airtablePromises:', airtablePromises.length);
    console.time('airtablePromises');
    await Promise.all(airtablePromises);
    console.timeEnd('airtablePromises');
  }
  return respond(200);
});

module.exports.consumeNewProgramUpdateDetails = RavenLambdaWrapper.handler(Raven, async event => {
  const program = JSON.parse(event.Records[0].body);
  const { id, programmingId, region } = program;
  if (!programmingId.includes('GDM')) {
    console.time('getProgramDetails');
    console.log('calling getProgramDetails');
    const programDetails = await getProgramDetails(program);
    console.timeEnd('getProgramDetails');
    if (!!programDetails) {
      const { description, progType: type } = programDetails;
      console.time('updateProgram');
      await updateProgram(id, region, description, type);
      console.timeEnd('updateProgram');
    }
  } else {
    console.info(`skipping ${programmingId}`);
  }
  return respond(200);
});

module.exports.updateGame = RavenLambdaWrapper.handler(Raven, async event => {
  const game: Game = getBody(event);
  console.log({ game });
  const programs = await dbProgram
    .query('gameId')
    .eq(game.id)
    .exec();
  const promises = [];
  for (const program of programs) {
    promises.push(updateProgramGame(program.id, program.region, game));
  }
  console.log('promises:', promises.length);
  await Promise.all(promises);
  return respond(200);
});

async function updateProgram(id, region, description, type) {
  console.log({ id, region, description, type });
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: process.env.tableProgram,
    Key: { id, region },
    UpdateExpression: 'set description = :newdescription, programType = :newtype',
    // ConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':newdescription': description,
      ':newtype': type,
      // ':id': id
    },
  };
  try {
    const x = await docClient.update(params).promise();
    console.log({ x });
  } catch (err) {
    console.log({ err });
    return err;
  }
}

function updateProgramGame(programId, region, game) {
  console.log({ programId, region, game });
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: process.env.tableProgram,
    Key: { id: programId, region },
    UpdateExpression: 'set game = :game',
    ExpressionAttributeValues: {
      ':game': game,
    },
  };
  try {
    return docClient.update(params).promise();
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

        // if channel is in minors list, try to add a minor channel to it
        // console.log(`minor evaluate: channel: ${program.channel}, ${channel.chId}`);
        if (minorChannels.map(c => c.channel).includes(program.channel)) {
          // program.channelMinor = 1;
          console.log('minor!');
          const minorChannelMatch = minorChannels.find(c => c.channel === program.channel);
          console.log({ minorChannelMatch });
          const channelMinor = minorChannelMatch.subChannels.find(c => c.channelIds.includes(channel.chId));
          console.log({ channelMinor });
          if (!!channelMinor) {
            program.channelMinor = channelMinor.minor;
            console.log('minor set');
          }
        }

        program.title = program.title !== 'Programming information not available' ? program.title : null;
        program.durationMins = program.duration;

        program.channelCategories = channel.chCat;
        program.subcategories = program.subcategoryList;
        program.mainCategory = program.mainCategory;

        program.live = program.ltd === 'Live' ? true : false;
        program.repeat = program.repeat;
        program.region = regionName;
        program.start = moment(program.airTime).unix() * 1000;
        program.end =
          moment(program.airTime)
            .add(program.durationMins, 'minutes')
            .unix() * 1000;
        program.id = generateId(program);
        programs.push(program);
      }
    });
  });
  // filter out duplicates - happens with sd/hd channels
  const filteredPrograms = uniqBy(programs, 'id');
  return filteredPrograms;
}

function generateId(program: Program) {
  const { programmingId, channel, start, region } = program;
  const id = programmingId + channel + start + region;
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
