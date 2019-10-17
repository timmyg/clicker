// @flow
require('dotenv').config();
const Airtable = require('airtable');
const { respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const request = require('async-request');

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
      // filterByFormula: `{Game Start} <= DATEADD(TODAY(),1,'d')`,
      filterByFormula: `DATETIME_DIFF(
                          DATETIME_FORMAT(
                              SET_TIMEZONE({Game Start}, 'America/New_York')
                              , 'M/D/YYYY h:mm'),
                          DATETIME_FORMAT(
                              SET_TIMEZONE(NOW(), 'America/New_York'),
                               'M/D/YYYY h:mm')
                        , 'hours')`,
    })
    .all();
  console.log(`found ${games.length} games`);
  if (!!games.length) {
    await sendControlCenterSlack(`*${games.length}* scheduled today`);
  } else {
    await sendControlCenterSlack(`No games scheduled today`);
  }
  return respond(200);
});

module.exports.runEndToEndTests = RavenLambdaWrapper.handler(Raven, async event => {
  const { circleToken } = process.env;

  // use request package, axios sucks with form data
  const url = 'https://circleci.com/api/v1.1/project/github/teamclicker/clicker/tree/develop';
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

async function sendControlCenterSlack(text) {
  await new Invoke()
    .service('notification')
    .name('sendControlCenter')
    .body({ text })
    .async()
    .go();
}
