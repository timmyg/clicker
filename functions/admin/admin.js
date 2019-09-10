require('dotenv').config();
const Airtable = require('airtable');
const { IncomingWebhook } = require('@slack/webhook');
const { respond, invokeFunctionSync } = require('serverless-helpers');

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.checkControlCenterEvents = async event => {
  // check if any scheduled events for control center today
  const controlCenterWebhook = new IncomingWebhook(process.env.slackControlCenterWebhookUrl);
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  let games = await base('Games')
    .select({
      view: 'Scheduled',
    })
    .all();
  console.log(`found ${games.length} games`);
  if (!games.length) {
    const text = `No games scheduled today for Control Center! (${process.env.stage})`;
    const icon_emoji = ':exclamation:';
    await controlCenterWebhook.send({
      text,
      icon_emoji,
    });
  }
  return respond(200);
};
