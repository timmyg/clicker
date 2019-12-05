// @flow
const Airtable = require('airtable');
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const request = require('request-promise');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

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
  let games = await base('Games')
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
  const url = `https://circleci.com/api/v1.1/project/github/teamclicker/clicker/tree/${branch}`;
  const options = {
    method: 'POST',
    form: { 'build_parameters[CIRCLE_JOB]': 'e2e/app' },
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

async function sendControlCenterSlack(text) {
  await new Invoke()
    .service('notification')
    .name('sendControlCenter')
    .body({ text })
    .async()
    .go();
}
