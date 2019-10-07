// @flow
require('dotenv').config();
const Airtable = require('airtable');
const { respond, Invoke } = require('serverless-helpers');

declare class process {
  static env: {
    airtableKey: string,
    airtableBase: string,
    stage: string,
  };
}

module.exports.health = async (event: any) => {
  return respond(200, `hello`);
};

module.exports.checkControlCenterEvents = async (event: any) => {
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
  if (!games.length) {
    // const title = 'Control Center Scheduling';
    const text = `No games scheduled today`;
    const color = process.env.stage === 'prod' ? 'danger' : null;
    await sendControlCenterSlack(text);
  }
  return respond(200);
};

async function sendControlCenterSlack(text) {
  const invoke = new Invoke();
  await invoke
    .service('message')
    .name('sendControlCenter')
    .body({ text })
    .go();
}
