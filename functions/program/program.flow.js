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
const { uniqBy, uniqWith } = require('lodash');
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
  id: string,
  name: string,
  defaultZip: string,
  localChannels: number[],
};

const allRegions: region[] = [
  {
    name: 'Cincinnati',
    id: 'cincinnati',
    defaultZip: '45202',
    localChannels: [5, 9, 12, 19, 661, 660],
  },
  // { id: 'chicago', name: 'Chicago', defaultZip: '60613', localChannels: [2, 5, 7, 32] },
  // { id: 'nyc', name: 'NYC', defaultZip: '10004', localChannels: [2, 4, 5, 7] },
  // { id: 'indy', name: 'Indy', defaultZip: '46204', localChannels: [4, 6, 13, 59] },
  { id: 'cripple-creek-co', name: 'Cripple Creek', defaultZip: '80813', localChannels: [5, 11, 13, 21] },
];
const nationalExcludedChannels: string[] = ['MLBaHD', 'MLB', 'INFO', 'NHLaHD'];
const nationalChannels: any[] = [
  { channel: 206, channelTitle: 'ESPN' },
  { channel: 209, channelTitle: 'ESPN2' },
  { channel: 208, channelTitle: 'ESPNU' },
  { channel: 207, channelTitle: 'ESPNN' },
  { channel: 213, channelTitle: 'MLB' },
  { channel: 219, channelTitle: 'FS1' },
  { channel: 220, channelTitle: 'NBCSN' },
  { channel: 212, channelTitle: 'NFL' },
  { channel: 217, channelTitle: 'TNNSHD' },
  { channel: 215, channelTitle: 'NHLHD' },
  { channel: 216, channelTitle: 'NBAHD' },
  { channel: 218, channelTitle: 'GOLF' },
  { channel: 602, channelTitle: 'TVG' },
  { channel: 612, channelTitle: 'ACCN' },
  { channel: 618, channelTitle: 'FS2' },
  { channel: 610, channelTitle: 'BTN' },
  { channel: 611, channelTitle: 'SECHD' },
  { channel: 605, channelTitle: 'SPMN' },
  { channel: 606, channelTitle: 'OTDR' },
  { channel: 221, channelTitle: 'CBSSN' },
  { channel: 245, channelTitle: 'TNT' },
  { channel: 247, channelTitle: 'TBS' },
  { channel: 705, channelTitle: 'NFLT' }, //NFL
  { channel: 706, channelTitle: 'NFLT' }, //NFL
  { channel: 707, channelTitle: 'NFLT' }, //NFL
  { channel: 708, channelTitle: 'NFLT' }, //NFL
  { channel: 709, channelTitle: 'NFLT' }, //NFL
  { channel: 710, channelTitle: 'NFLT' }, //NFL
  { channel: 711, channelTitle: 'NFLT' }, //NFL
  { channel: 712, channelTitle: 'NFLT' }, //NFL
  { channel: 713, channelTitle: 'NFLT' }, //NFL
  { channel: 714, channelTitle: 'NFLT' }, //NFL
  { channel: 715, channelTitle: 'NFLT' }, //NFL
  { channel: 716, channelTitle: 'NFLT' }, //NFL
  { channel: 717, channelTitle: 'NFLT' }, //NFL
  { channel: 718, channelTitle: 'NFLT' }, //NFL
  { channel: 719, channelTitle: 'NFLT' }, //NFL
  // 671 // FSMW, turned on at tin roof once
  //   701, //NFLMX // 4 game mix
  // 702, //NFLMX // 8 game mix
  { channel: 703, channelTitle: 'NFLRZ' }, // Redzone (premium)
  { channel: 704, channelTitle: 'NFLFAN' }, // Fantasy Zone (premium)
];

// 2661
const complexChannels = [
  {
    channel: 660,
    subChannels: [
      {
        minor: null,
        channelIds: [2660],
      },
      {
        minor: 1,
        channelIds: [5660],
      },
      { minor: 2, channelIds: [624] }, // 623?
    ],
  },
  {
    channel: 661,
    subChannels: [
      {
        minor: null,
        channelIds: [2661],
      },
      {
        minor: 1,
        channelIds: [5661], // 2661?
      },
      { minor: 2, channelIds: [625] }, //  626
    ],
  },
];

// const blacklistChannelIds = [5660, 2660, 623, 624, 625, 376, 2661];
const blacklistChannelIds = [];

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
    channelId: Number,
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
    hd: Boolean,
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
    isSports: Boolean,
    isLocal: Boolean,
  },
  {
    saveUnknown: ['game'],
    timestamps: true,
    expires: {
      ttl: 86400,
      attribute: 'expires',
      returnExpiredItems: false,
      defaultExpires: x => {
        // expire 6 hours after end
        return moment(x.end)
          .add(6, 'hours')
          .toDate();
      },
    },
  },
);

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `${process.env.serviceName}: i\'m flow good (table: ${process.env.tableProgram})`);
});

module.exports.regions = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, allRegions);
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
  console.log(event.queryStringParameters);
  const previousProgramMinutesAgo = 90;
  const {
    channel,
    channelMinor,
    time,
    region,
    programmingId,
    programmingIds: programmingIdsString,
  } = event.queryStringParameters;
  let programmingIds;
  if (programmingIdsString) {
    programmingIds = programmingIdsString.split(',');
  }
  if (!region) {
    return respond(400, `need region: ${region}`);
  }
  if (!channel && !programmingId && !programmingIds) {
    return respond(
      400,
      `need channel/programmingId/programmingIds: ${JSON.stringify({
        channel,
        programmingId,
        programmingIds,
      })}`,
    );
  }
  if (channel) {
    const timeToSearch = time || moment().unix() * 1000;
    const timeToSearchPreviousProgram =
      moment(timeToSearch)
        .subtract(previousProgramMinutesAgo, 'm')
        .unix() * 1000;
    // get programs that are on now or ended within last 30 mins
    let programsQuery = dbProgram
      .query('channel')
      .eq(channel)
      .and()
      .filter('region')
      .eq(region)
      .and()
      .filter('start')
      .lt(timeToSearch) // now
      .and()
      .filter('end')
      .gt(timeToSearchPreviousProgram) // 90 minutes ago
      .and()
      .filter('channelMinor');

    if (channelMinor && channelMinor <= 10 && [660, 661].includes(channel)) {
      programsQuery = programsQuery.eq(channelMinor);
    } else {
      programsQuery = programsQuery.null();
    }

    const programs: Program[] = await programsQuery.exec();
    console.log({ programs });

    console.log({ timeToSearch, timeToSearchPreviousProgram });

    // this was causing issues getting location (location.boxes.program.subcategories) when it was empty
    // delete programs[0].subcategories;
    programs.forEach(p => {
      // $FlowFixMe
      delete p.subcategories;
      // $FloplwFixMe
      delete p.channelCategories;
      p.startFromNow = moment(p.start).fromNow();
      p.endFromNow = moment(p.end).fromNow();
    });
    console.log(`programs: ${programs.length}`);
    const sortedPrograms = programs.sort((a, b) => a.start - b.start);
    const existingProgram = sortedPrograms[sortedPrograms.length - 1];
    console.log({ existingProgram });
    if (sortedPrograms.length > 1) {
      console.log(' is multiple');
      // check if first program is game, and if it is over
      const previousProgram = sortedPrograms[0];
      console.log({ previousProgram });
      if (previousProgram.game && previousProgram.game.status === 'inprogress') {
        console.log('previous game in progress');
        return respond(200, previousProgram);
      }
    } else if (
      existingProgram &&
      (moment(existingProgram.start).diff(moment()) > 0 || moment(existingProgram.end).diff(moment()) < 0)
    ) {
      console.info('no current program');
      return respond(200, {});
    }
    console.log('returning existing program');
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
    // const sortedPrograms = programs.sort((a, b) => a.start - b.start);
    const chosenPrograms = programs.length > 1 ? getProgramListTiebreaker(programs) : programs;
    return respond(200, chosenPrograms[0]);
  } else if (programmingIds) {
    const now = moment().unix() * 1000;
    const programs: Program[] = await dbProgram
      .query('region')
      .eq(region)
      .and()
      .filter('programmingId')
      .in(programmingIds)
      .and()
      .filter('start')
      .lt(now)
      .and()
      .filter('end')
      .gt(now)
      .exec();
    const sortedPrograms = programs.sort((a, b) => a.start - b.start);
    console.log('querying for', region, { programmingIds });
    console.log('returned', programs.map(p => p.programmingId));
    if (programmingIds.length > programs.length) {
      // console.error(`missing: ${programmingIds.map(pid => !programs.map(p => p.programmingId).includes(pid))}`);
      console.error(
        `missing: ${programmingIds.filter(function(el) {
          return programs.map(p => p.programmingId).indexOf(el) < 0;
        })}`,
      );
      const errorText = 'Program not found in database';
      console.error(errorText);
      console.error({ channel, time, region, programmingId, programmingIds });
      Raven.captureException(new Error(errorText));
    }
    const chosenPrograms2 = sortedPrograms.length > 1 ? getProgramListTiebreaker(sortedPrograms) : sortedPrograms;
    return respond(200, chosenPrograms2);
  }
});

module.exports.getAll = RavenLambdaWrapper.handler(Raven, async event => {
  const params = getPathParameters(event);
  const { locationId } = params;

  console.time('entire call');
  console.time('get location');
  console.log({ locationId });
  const { data: location }: { data: Venue } = await new Invoke()
    .service('location')
    .name('get')
    .pathParams({ id: locationId })
    .headers(event.headers)
    .go();
  console.timeEnd('get location');
  if (!location) {
    return respond(400, 'location doesnt exist');
  }

  if (location.demo) {
    const demoPrograms: any[] = [
      {
        title: '2019 Masters',
        channelTitle: 'Golf',
        channel: 218,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(4, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 9,
        subcategories: ['Golf'],
      },
      {
        title: 'Clemson vs. Ohio State',
        channelTitle: 'FOX',
        channel: 19,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(30)
            .unix() * 1000,
        isSports: true,
        clickerRating: 10,
        subcategories: ['Football'],
      },
      {
        title: 'Cincinnati @ Xavier',
        channelTitle: 'FS1',
        channel: 219,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Basketball'],
        game: { home: { book: { spread: '-4', moneyline: '-144' } }, summary: { description: 'UC 59 - XU 71' } },
      },
      {
        title: 'Arsenal vs. Bayern',
        channelTitle: 'NBCSN',
        channel: 220,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Soccer'],
      },
      {
        title: 'College Gameday',
        channelTitle: 'ESPN',
        channel: 206,
        start:
          moment()
            .subtract(3, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Football'],
      },
      {
        title: 'Duke @ North Carolina',
        channelTitle: 'ESPN2',
        channel: 209,
        start:
          moment()
            .subtract(2, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Basketball'],
      },
      {
        title: 'Texas Tech vs. Louisville',
        channelTitle: 'ACCN',
        channel: 612,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Basketball'],
      },
      {
        title: 'XFL: Wildcats @ Roughnecks',
        channelTitle: 'ABC',
        channel: 9,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(2, 'h')
            .minutes(30)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Football'],
      },
      {
        title: 'FC Cincinnati @ Louisville City',
        channelTitle: 'WSRT',
        channel: 64,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Soccer'],
      },
      {
        title: 'Florida State @ Wake Forest',
        channelTitle: 'ESPNU',
        channel: 208,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(2, 'h')
            .minutes(30)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Football'],
      },
      {
        title: '2016: Jazz @ Lakers',
        channelTitle: 'ESPNC',
        replay: true,
        channel: 618,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Basketball'],
      },
      {
        title: 'Navy @ Notre Dame',
        channelTitle: 'NBC',
        channel: 5,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Football'],
      },
      {
        title: 'WWE Raw',
        channelTitle: 'TNT',
        channel: 245,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(3, 'h')
            .minutes(30)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Wrestling'],
      },

      {
        title: 'Orioles @ Reds',
        channelTitle: 'FSN',
        channel: 661,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['Baseball'],
      },
      {
        title: 'UFC 247: Jones vs. Reyes',
        channelTitle: 'FS2',
        channel: 612,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        isSports: true,
        clickerRating: 7,
        subcategories: ['MMA'],
      },
      {
        title: 'Friends',
        channelTitle: 'TBS',
        channel: 9,
        start:
          moment()
            .subtract(1, 'h')
            .minutes(0)
            .unix() * 1000,
        end:
          moment()
            .add(1, 'h')
            .minutes(0)
            .unix() * 1000,
        clickerRating: 7,
        subcategories: ['MMA'],
      },
    ];
    return respond(200, demoPrograms);
  }

  // get all programs for right now
  const now = moment().unix() * 1000;
  const in25Mins =
    moment()
      .add(25, 'minutes')
      .unix() * 1000;

  console.time('current + next programming setup queries');

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
  console.timeEnd('current + next programming setup queries');

  console.time('current + next programming query');
  const [programs: Program[], programsNext: Program[]] = await Promise.all([programsQuery, programsNextQuery]);
  // console.log(programs.length, programsNext.length);
  console.timeEnd('current + next programming query');

  console.time('current + next programming combine');
  let currentPrograms: Program[] = programs;
  const nextPrograms: Program[] = programsNext;
  currentPrograms.forEach((program, i) => {
    const nextProgram = nextPrograms.find(
      np => np.channel === program.channel && np.programmingId !== program.programmingId,
    );
    if (nextProgram) {
      currentPrograms[i].nextProgramTitle = nextProgram.title;
      currentPrograms[i].nextProgramStart = nextProgram.start;
    }
    if (currentPrograms[i].mainCategory === 'Sports') {
      currentPrograms[i].isSports = true;
    }
  });
  console.timeEnd('current + next programming combine');

  // console.log('exclude', location.channels);
  console.time('remove excluded');
  if (location.channels && location.channels.exclude) {
    const excludedChannels = location.channels.exclude.map(function(item) {
      return parseInt(item, 10);
    });
    currentPrograms = currentPrograms.filter(p => !excludedChannels.includes(p.channel));
  }
  console.timeEnd('remove excluded');

  console.time('sort');
  // sort
  currentPrograms = currentPrograms.sort((a, b) => (b.clickerRating || 0) - (a.clickerRating || 0));
  currentPrograms = [
    ...currentPrograms.filter(cp => cp.mainCategory === 'Sports'),
    ...currentPrograms.filter(cp => cp.mainCategory !== 'Sports'),
  ];
  console.timeEnd('sort');

  console.timeEnd('entire call');
  return respond(200, currentPrograms);
});

module.exports.syncRegions = RavenLambdaWrapper.handler(Raven, async event => {
  try {
    for (const region of allRegions) {
      const { defaultZip, id, localChannels } = region;
      console.log(`sync local channels: ${id}/${defaultZip} for channels ${localChannels.join(', ')}`);
      await new Invoke()
        .service('program')
        .name('syncRegionNextFewHours')
        .body({ id, localChannels, defaultZip })
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
  const { id: regionId, defaultZip, localChannels } = getBody(event);
  await syncRegionChannels(regionId, localChannels, defaultZip);
  return respond(200);
});

module.exports.clearDatabase = RavenLambdaWrapper.handler(Raven, async event => {
  // clear programs table
  const promises = [];
  for (const region of allRegions) {
    const regionId = region.id;
    const regionPrograms = await dbProgram
      .query('region')
      .using('startLocalIndex')
      .eq(regionId)
      .where('start')
      .descending()
      .exec();
    const keys = regionPrograms.map(rp => {
      return { region: regionId, id: rp.id };
    });
    promises.push(dbProgram.batchDelete(keys));
  }

  console.time('deleteDb');
  await Promise.all(promises);
  console.timeEnd('deleteDb');

  return respond(200, 'ok');
});

module.exports.clearAirtable = RavenLambdaWrapper.handler(Raven, async event => {
  // clear control center records
  const airtablesToClear = ['Control Center', 'Games'];
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  for (const table of airtablesToClear) {
    const allRecords = await base(table)
      .select()
      .all();
    const allRecordsIds = allRecords.map(g => g.id);
    console.log('allRecordsIds.length', allRecordsIds.length);
    const promises = [];
    let count = 0;
    while (!!allRecordsIds.length) {
      try {
        const allRecordsSlice = allRecordsIds.splice(0, 10);
        count += allRecordsSlice.length;
        promises.push(base(table).destroy(allRecordsSlice));
      } catch (e) {
        console.error(e);
      }
    }
    console.log('promises', promises.length);
    console.time(`deleteAirtable:${table}`);
    await Promise.all(promises);
    console.timeEnd(`deleteAirtable:${table}`);
  }

  return respond(200, 'ok');
});

module.exports.syncAirtable = RavenLambdaWrapper.handler(Raven, async event => {
  const { stage } = process.env;
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtablePrograms = 'Control Center';
  const datesToPull = [];
  let daysToPull = 2;
  if (stage === 'develop') {
    daysToPull = 7;
  }
  [...Array(daysToPull)].forEach((_, i) => {
    const dateToSync = moment()
      .subtract(5, 'hrs')
      .add(i, 'days')
      .toDate();
    datesToPull.push(dateToSync);
  });
  console.log({ datesToPull });
  for (const region of allRegions) {
    const results = await pullFromDirecTV(region.id, region.localChannels, region.defaultZip, datesToPull, 24);
    // TODO:SENTRY results is not iterable
    for (const result of results) {
      const schedule = result.data;
      let allPrograms: Program[] = build(schedule, region.id);
      // allPrograms = allPrograms.filter(p => !!p.live);
      // allPrograms = uniqBy(allPrograms, 'programmingId');
      // filter out programs already created
      const allExistingPrograms = await base(airtablePrograms)
        .select({ fields: ['programmingId', 'start', 'channelTitle'] })
        .all();

      // filter out allPrograms where there is an existing game with same programmingId, start and channel title
      console.log('existing programs:', allExistingPrograms.length);
      console.log('pulled programs:', allPrograms.length);
      allPrograms = allPrograms.filter((program: Program) => {
        const { programmingId, start, channelTitle } = program;
        const alreadyExists = allExistingPrograms.some(
          ep =>
            ep.fields.programmingId === programmingId &&
            moment(ep.fields.start).unix() * 1000 === start &&
            ep.fields.channelTitle === channelTitle,
        );
        return !alreadyExists;
      });
      console.log('pulled programs unique:', allPrograms.length);

      let allAirtablePrograms = buildAirtablePrograms(allPrograms);
      console.time('create');
      while (!!allAirtablePrograms.length) {
        try {
          const promises = [];
          const programsSlice = allAirtablePrograms.splice(0, 10);
          // console.log('batch putting:', programsSlice.length, 'remaining:', allAirtablePrograms.length);
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

async function getAirtableProgramsInWindow(hoursAgo = 4, hoursFromNow = 4) {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtableProgramsName = 'Control Center';
  const fourHoursAgo = moment()
    .subtract(hoursAgo, 'h')
    .toISOString();
  const fourHoursFromNow = moment()
    .add(hoursFromNow, 'h')
    .toISOString();

  let filterByFormula: string[] = [];
  filterByFormula.push(`{start} > '${fourHoursAgo}'`);
  filterByFormula.push(`{start} < '${fourHoursFromNow}'`);
  filterByFormula.push(`{rating} != BLANK()`);
  filterByFormula.push(`{isOver} != 'Y'`);
  console.time('airtable call');
  const updatedAirtablePrograms = await base(airtableProgramsName)
    .select({
      filterByFormula: `AND(${filterByFormula.join(',')})`,
      sort: [{ field: 'start', direction: 'asc' }],
    })
    .all();
  console.timeEnd('airtable call');
  return updatedAirtablePrograms;
}

module.exports.upcoming = RavenLambdaWrapper.handler(Raven, async event => {
  const { location } = getBody(event);

  const locationProgrammingIds = location.boxes
    .filter(b => b.configuration.automationActive)
    .map(b => b.program && b.program.programmingId);
  const allUpcomingPrograms = await getAirtableProgramsInWindow();
  const upcomingPrograms = allUpcomingPrograms.filter(upcoming => !locationProgrammingIds.includes(upcoming.episodeId));

  return respond(200, upcomingPrograms);
});

module.exports.syncAirtableUpdates = RavenLambdaWrapper.handler(Raven, async event => {
  const updatedAirtablePrograms = await getAirtableProgramsInWindow(6, 1);
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

function buildAirtablePrograms(programs: Program[]) {
  const transformed = [];
  programs.forEach(program => {
    const {
      programmingId,
      title,
      description,
      channel,
      channelMinor,
      channelTitle,
      live,
      start,
      end,
      region,
    } = program;
    const meta = { channel, channelMinor, region };
    const defaultClickerRating = getDefaultRating(program);
    transformed.push({
      fields: {
        programmingId,
        title,
        description,
        // channel,
        // channelMinor,
        // region,
        channelTitle,
        live,
        start,
        end,
        rating: defaultClickerRating,
        meta: JSON.stringify(meta),
      },
    });
  });
  return transformed;
}

async function syncRegionChannels(regionName: string, regionChannels: number[], zip: string) {
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
  allPrograms = uniqBy(allPrograms, 'id');
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
    const nationalChannelNumbers = nationalChannels.map(nc => nc.channel);
    const channelsString = getChannels([...regionChannels, ...nationalChannelNumbers]).join(',');
    promises.push(
      new Invoke()
        .service('program')
        .name('getSchedulePy')
        .queryParams({
          start: startTime.toString(),
          zip,
          hours: totalHours,
          channels: channelsString,
        })
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
    const airtableBase = new Airtable({
      apiKey: process.env.airtableKey,
    }).base(process.env.airtableBase);
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

function build(dtvSchedule: any, regionId: string) {
  // pass in channels array (channel, channelMinor) so that we can include the minor number, if needed
  const programs = [];
  dtvSchedule.forEach(channel => {
    channel.schedules.forEach(program => {
      program.programmingId = program.programID;
      if (program.programmingId !== '-1' && !nationalExcludedChannels.includes(channel.chCall)) {
        program.channel = channel.chNum;
        program.channelId = channel.chId;
        program.hd = channel.chHd;
        program.blackout = channel.blackOut;
        if (blacklistChannelIds.includes(program.channelId)) {
          return true;
        }
        program.channelTitle = getLocalChannelName(channel.chName) || channel.chCall;

        // if channel is in minors list, try to add a minor channel to it
        // console.log(`minor evaluate: channel: ${program.channel}, ${channel.chId}`);
        if (complexChannels.map(c => c.channel).includes(program.channel)) {
          // program.channelMinor = 1;
          // console.log('minor!');
          const minorChannelMatch: any = complexChannels.find(c => c.channel === program.channel);
          // console.log({ minorChannelMatch });
          const channelMinor = minorChannelMatch.subChannels.find(c => c.channelIds.includes(channel.chId));
          // console.log({ channelMinor });
          if (!!channelMinor) {
            program.channelMinor = channelMinor.minor;
            // console.log('minor set');
          }
        }

        program.title = program.title !== 'Programming information not available' ? program.title : null;
        program.durationMins = program.duration;

        program.channelCategories = channel.chCat;
        program.subcategories = program.subcategoryList;
        program.mainCategory = program.mainCategory;

        // console.log(allRegions, regionId);
        const region: region = allRegions.find(r => r.id === regionId);
        if (region.localChannels.includes(program.channel)) {
          program.isLocal = true;
        }
        program.live = program.ltd === 'Live' ? true : false;
        program.repeat = program.repeat;
        program.region = regionId;
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

function getDefaultRating(program: Program): ?number {
  const defaultRatings = [
    { search: 'sportscenter', rating: 2 },
    { search: 'nfl live', rating: 1 },
    { search: 'nfl now', rating: 1 },
    { search: 'nfl total access', rating: 1 },
    { search: 'good morning football', rating: 1 },
    // { search: 'nba: the jump', rating: 1 },
    { search: 'skip and shannon', rating: 1 },
    { search: 'college gameday', rating: 5 },
    { search: 'mlb tonight', rating: 1 },
    { search: 'inside the nba', rating: 1 },
    { search: 'nfl total access', rating: 1 },
    { search: 'quick pitch', rating: 1 },
  ];

  const ratingsIgnore = ['the best of this is sportscenter'];

  // first things first
  // speak for yourself
  // high noon
  // golic & wingo
  // first take
  // get up
  // the dan le batard show

  const match = defaultRatings.find(dr => program.title.toLowerCase().includes(dr.search.toLowerCase()));
  if (match && !ratingsIgnore.includes(program.title.toLowerCase())) {
    return match.rating;
  }
}

function generateId(program: Program) {
  const { programmingId, channel, start, region } = program;
  let id = programmingId + channel + start;
  if (region) {
    id += region;
  }
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

function getProgramListTiebreaker(programs: Program[]): Program[] {
  console.log('! ! ! ! ! ! programs', programs.length);
  // get unique set of programmingIds
  const programmingIds = programs.map(p => p.programmingId);
  const uniqueProgrammingIds = [...new Set(programmingIds)];
  console.log({ uniqueProgrammingIds });
  const deduplicatedPrograms = [];
  uniqueProgrammingIds.forEach(pId => {
    const duplicatedPrograms = programs.filter(p => p.programmingId === pId);
    if (duplicatedPrograms.length > 1) {
      const localChannel = duplicatedPrograms.find(({ channel }) => channel > 0 && channel < 100);
      const regionalChannel = duplicatedPrograms.find(({ channel }) => channel >= 600 && channel < 700);
      const nationalChannel = duplicatedPrograms.find(({ channel }) => channel > 200 && channel < 300);
      const premiumChannels = duplicatedPrograms.find(({ channel }) => channel >= 700);

      if (localChannel) return deduplicatedPrograms.push(localChannel);
      if (regionalChannel) return deduplicatedPrograms.push(regionalChannel);
      if (nationalChannel) return deduplicatedPrograms.push(nationalChannel);
      if (premiumChannels) return deduplicatedPrograms.push(premiumChannels);

      // stumped
      return deduplicatedPrograms.push(duplicatedPrograms[0]);
    } else {
      return deduplicatedPrograms.push(duplicatedPrograms[0]);
    }
  });

  console.log('dd', deduplicatedPrograms.length);
  return deduplicatedPrograms;
}

module.exports.build = build;
module.exports.generateId = generateId;
module.exports.getLocalChannelName = getLocalChannelName;
module.exports.getChannels = getChannels;
module.exports.getDefaultRating = getDefaultRating;
module.exports.getProgramListTiebreaker = getProgramListTiebreaker;
