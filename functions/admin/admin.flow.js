// @flow
const Airtable: any = require('airtable');
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const request = require('request-promise');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const airtableControlCenterV1 = 'Control Center v1';

declare class process {
  static env: {
    airtableKey: string,
    airtableBase: string,
    circleToken: string,
    stage: string,
  };
}

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.checkControlCenterEvents = RavenLambdaWrapper.handler(Raven, async event => {
  // check if any scheduled events for control center today
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  // find games scheduled for the next 24 hours
  let games = await base(airtableControlCenterV1)
    .select({
      view: 'Scheduled',
      filterByFormula: `AND( {Started Hours Ago} <= 0, {Started Hours Ago} > -14 )`,
    })
    .all();
  console.log(`found ${games.length} games`);
  console.log(games);
  if (!!games.length) {
    await sendControlCenterSlack(`*${games.length}* games scheduled today`);
  } else {
    await sendControlCenterSlack(`No games scheduled today`);
  }
  return respond(200);
});

module.exports.runEndToEndTests = RavenLambdaWrapper.handler(Raven, async event => {
  const { circleToken, stage } = process.env;

  const branch = stage === 'prod' ? 'master' : stage;
  // use request package, axios sucks with form data
  const body = {
    parameters: {
      trigger: false,
      'e2e-app': true,
    },
    branch: 'master',
  };
  const url = `https://circleci.com/api/v2/project/github/teamclicker/clicker/pipeline`;
  const options = {
    method: 'POST',
    body,
    auth: {
      user: circleToken,
    },
  };

  const response = await request(url, options);

  return respond(200, response);
});

module.exports.logChannelChange = RavenLambdaWrapper.handler(Raven, async event => {
  const { location, zone, from, to, time, type, boxId } = getBody(event);
  console.log({ location, zone, from, to, time, type, boxId });
  console.time('send to airtable');
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  await base('Channel Changes').create(
    {
      Location: location,
      Zone: zone,
      From: from ? from.toString() : null,
      To: to.toString(),
      Time: time,
      Type: type,
      'Box Id': boxId,
    },
    { typecast: true },
  );
  console.timeEnd('send to airtable');

  return respond(200);
});

module.exports.airtableRemoveExpired = RavenLambdaWrapper.handler(Raven, async event => {
  const tableNames = ['Control Center v1', 'Channel Changes', 'Control Center', 'Games', 'Now Showing'];
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  let count = 0;
  for (const tableName of tableNames) {
    console.log({ tableName });
    const expired = await base(tableName)
      .select({ view: 'Expired' })
      .all();
    console.log({ expired });
    const expiredIds = expired.map(g => g.id);
    console.log({ expiredIds });
    const promises = [];
    while (!!expiredIds.length) {
      try {
        const expiredSlice = expiredIds.splice(0, 10);
        count += expiredSlice.length;
        // console.log('batch putting:', expiredSlice.length);
        // console.log('remaining:', expiredIds.length);
        promises.push(base(tableName).destroy(expiredSlice));
        await Promise.all(promises);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return respond(200, { count });
});

async function sendControlCenterSlack(text) {
  await new Invoke()
    .service('notification')
    .name('sendControlCenter')
    .body({ text })
    .async()
    .go();
}
