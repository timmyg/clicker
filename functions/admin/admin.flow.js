// @flow
require('dotenv').config();
const Airtable = require('airtable');
const { respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');

declare class process {
  static env: {
    airtableKey: string,
    airtableBase: string,
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
      filterByFormula: `AND( {Started Hours Ago} >= 0, {Started Hours Ago} < -14 )`,
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

async function sendControlCenterSlack(text) {
  await new Invoke()
    .service('notification')
    .name('sendControlCenter')
    .body({ text })
    .async()
    .go();
}
