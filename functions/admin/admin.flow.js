// @flow
require('dotenv').config();
const Airtable = require('airtable');
const { IncomingWebhook } = require('@slack/webhook');
const { respond, invokeFunctionSync } = require('serverless-helpers');

declare class process {
  static env: {
    slackControlCenterWebhookUrl: string,
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
  const controlCenterWebhook = new IncomingWebhook(process.env.slackControlCenterWebhookUrl);
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
    const text = `No games scheduled today for Control Center _(${process.env.stage})_`;
    const icon_emoji = ':exclamation:';
    await controlCenterWebhook.send({
      text,
      icon_emoji,
    });
  }
  return respond(200);
};
