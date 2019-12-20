// @flow
const dynamoose = require('dynamoose');
const awsXRay = require('aws-xray-sdk');
const AWS = require('aws-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const axios = require('axios');
const moment = require('moment');
const { uniqBy } = require('lodash');
const uuid = require('uuid/v5');
const { respond, getPathParameters, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const directvEndpoint = 'https://www.directv.com/json';
const curlirize = require('axios-curlirize');
curlirize(axios);

declare class process {
  static env: {
    tableProgram: string,
    serviceName: string,
    tableProgram: string,
    tableProgramArea: string,
    stage: string,
    newProgramTopicArn: string,
    NODE_ENV: string,
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
const Program = dynamoose.model(
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
  console.log('hi', process.env.tableProgram);
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
  const programsQuery = Program.query('region')
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

  const programsNextQuery = Program.query('region')
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
  // channels may have minor channel, so get main channel number
  const channels = regionChannels.concat(nationalChannels);
  const channelsString = getChannels(channels).join(',');

  // get latest program
  console.log('querying region:', regionName);
  // const regionPrograms = await Program.query('region').eq(regionName).exec();
  const regionPrograms = await Program.query('region')
    .using('startLocalIndex')
    .eq('cincinnati')
    .where('start')
    .descending()
    .exec();

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

  axios.defaults.headers.common = {};

  const params = { startTime, hours: totalHours, channels: channelsString };
  const headers = {
    Cookie: `dtv-zip=${zip};`,
    'User-Agent': 'PostmanRuntime/7.20.1',
    Host: 'www.directv.com',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    Accept: '*/*',
    Referer: 'https://www.directv.com/assets/js/dtve/apps/guide/programDataServiceProcessor.js',
    Cookie: `mt.v=2.1466175897.1563574796128; UUID=f6899649-9227-a699-31c3-1d5c3d8c92f1; ATTAUID=f6899649-9227-a699-31c3-1d5c3d8c92f1; _gcl_au=1.1.1823743367.1563574802; _vwo_uuid_v2=D2D7400BE22918AD69B452B1B1E1A2666|b30a65828538f1ebe4a25ff8c52e4dd0; _ga=GA1.2.1318115268.1566430965; _vwo_uuid=D2D7400BE22918AD69B452B1B1E1A2666; s_ecid=MCMID%7C37497605615920232153808414103863898501; AAMC_directv_0=REGION%7C7; QuantumMetricUserID=0af63c54d0479b8801ca55a32e157214; dtvzip=45212; s_channel=%5B%5B%27Typed%2FBookmarked%27%2C%271571880628756%27%5D%5D; customer=yes; rxVisitor=1574734794183ADK8ETJHB0HO5Q1THTARU6A2845KH03A; _fbp=fb.1.1574734798308.810801891; dtvpepod=OLD; DYN_USER_ID=344823247_TMBR; DYN_USER_CONFIRM=e5769f3d258bdea357e115a6c3b80fa4; DCPROSPECT=DEN; IDPROOT-TEST=AB-IDPROOT-New; AMCVS_55633F7A534535110A490D44%40AdobeOrg=1; AMCVS_8EAC67C25245B1820A490D4C%40AdobeOrg=1; intent=all; dtv-lsid=ck448zjox0s4xvrqlwp7mkxvh; s_cc=true; QuantumMetricSessionID=6e6fe7c173e4645db3866ef661f0f525; s_tps=NaN; TLTSID=6B13C0081DB9101D0006B8AE1DD96EAC; TLTUID=6B13C0081DB9101D0006B8AE1DD96EAC; dtv-msg-key-cache=f2f4b6987855de75fb25f643800680fe9e3b7e71; AB_IDPROOT=new_idproot_20190410; mboxEdgeCluster=28; dtve-tour-browse=false; ak_bmsc=C6EF9AA9209E310FF64A21DB926A165A17C91FD40F3A0000DECCFC5DC433AE1A~platTEhH0PumXgGlURYHuqLxT7nJoDBcePMH/qgDR2gUxHI4Yml1LmlGTXAFlRRa7MSaMfQqr9Zsz9WyJ+C2Af4BwzDLDwkQzKFOFKAGtkS+WGi05JJqsA/f4MC0PbzDusu0FcyZffnAi/Jq3ltl2L7vbRZ65ghwpvpqdwEb6ALHpWw3tA6ptOCjQe1yZ/7+ZZht2tZeAuyQ6ZgjHNxGY4sxn9zw/fdHfmQW062hPxugsojor71ARd4OcxFzzUjDQY; s_dfa=attglobalprod%2Cattconprod; s_visit=1; gpv_v100=DTVE%3AGuide%3AIndex; s_lv_s=Less%20than%207%20days; s_vnum30=1579440650152%26vn%3D1; s_invisit30=true; s_vnum90=1580174259121%26vn%3D9; s_invisit90=true; AMCV_55633F7A534535110A490D44%40AdobeOrg=1994364360%7CMCIDTS%7C18251%7CMCMID%7C45520962155196799464611593993742998752%7CMCAAMLH-1577454765%7C7%7CMCAAMB-1577454765%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1576855807s%7CNONE%7CMCAID%7CNONE%7CMCCIDH%7C-1045351470%7CvVersion%7C3.4.0; AMCV_8EAC67C25245B1820A490D4C%40AdobeOrg=1994364360%7CMCMID%7C37497605615920232153808414103863898501%7CMCAAMLH-1577454768%7C7%7CMCAAMB-1577454768%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1576857158s%7CNONE%7CvVersion%7C3.4.0%7CMCIDTS%7C18251%7CMCAID%7CNONE%7CMCCIDH%7C2121515433; JSESSIONID=Hpxtd8VpT6vkyCqnX5pqYNbY90Mfp1Gy3HJVyDmJQ2TmQ2zX7kDJ\u002182210185; s_lv=1576851034164; s_ppvl=DTVE%253AGuide%253AIndex%2C10%2C10%2C293%2C1278%2C293%2C1440%2C900%2C2%2CL; s_ppv=DTVE%253AGuide%253AIndex%2C10%2C10%2C293%2C1278%2C293%2C1440%2C900%2C2%2CL; aam_uuid=37773931934871179653798812908357691303; pses={"id":"zrmh0g2uj7m","start":1576848657437,"last":1576851035191}; s_pvs=5; bm_sv=62BED3BD13C5CF077F981AF478FA41C2~vGVaOa+YmcBrlnkaQ6cgwKunz3DaGiCA3DrLf8jhfLDklQ0zUCOwkAQuz7g1rlzjgaZHYOg1Xu56kJP9SaQrTETpqkSGl/L+gAV06fG75nNGuqqr24shqeUCaTrL954+ILGjhULePfsUxyao8eg2y/vJ6YUnCfpomGTQ9u+D9Ow=; fsr.s={"v2":-2,"v1":1,"rid":"de35430-94389467-e7c5-42c4-f8671","to":5,"c":"https://www.directv.com/guide","pv":5,"f":1576851043416,"lc":{"d2":{"v":1,"s":false,"e":2}},"cd":2,"cp":{"DTV_TealeafID":"6B13C0081DB9101D0006B8AE1DD96EAC","DTV_VisitorID":"45520962155196799464611593993742998752"}}; RT="z=1&dm=www.directv.com&si=665fda42-1ead-40e3-afab-bf8731b33f82&ss=k4e6y0kk&sl=4&tt=8su&bcn=%2F%2F173e2549.akstat.io%2F"; mbox=PC#4df2c363b0054301b806ffeb290000ab.28_66#1640095845|session#2087d6a2f5164be98b318a147e56a7f8#1576852906`,
    Connection: 'keep-alive',
  };
  const method = 'get';
  console.log('Dummy server started on port 7500');
  const x = await axios.get(`https://jsonplaceholder.typicode.com/users`);
  console.log({ x });
  // const z = await axios.get('https://www.directv.com/json/program/flip/EP000199170206');
  // console.log({ z });
  console.log('getting channels 2.... ->', url, params, headers);
  // let result2 = await axios({ method, url, params, headers });
  let result2 = await axios.get(url, { params, headers, crossdomain: true });
  console.log(result2);
  let { schedule } = result2.data;
  let allPrograms = build(schedule, regionName);
  console.log('allPrograms:', allPrograms.length);
  let transformedPrograms = buildProgramObjects(allPrograms);
  console.log('transformedPrograms', transformedPrograms.length);
  let dbResult = await Program.batchPut(transformedPrograms);
  console.log(dbResult);

  // get program ids, publish to sns topic to update description
  const sns = new AWS.SNS({ region: 'us-east-1' });
  let i = 0;
  for (const program of transformedPrograms) {
    console.log(i);
    const messageData = {
      Message: JSON.stringify(program),
      TopicArn: process.env.newProgramTopicArn,
    };

    try {
      await sns.publish(messageData).promise();
      i++;
    } catch (e) {
      console.error(e);
    }
  }
  console.log(i, 'topics published to:', process.env.newProgramTopicArn);
}

module.exports.consumeNewProgram = RavenLambdaWrapper.handler(Raven, async event => {
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

    // let program = await getProgram(id, region);
    // if (!!program.id) {
    if (description && description.length) {
      await updateProgram(id, region, description);
    }
    //   console.log('program saved');
    // } else {
    //   console.log('no program by id:', id);
    // }
    return respond(200);
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.log('404!!');
      console.error(e);
    }
    console.error(e);
    // throw e;
    return respond(400);
  }
});

// async function updateProgram(data) {
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
