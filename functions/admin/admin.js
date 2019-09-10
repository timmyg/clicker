require('dotenv').config();
const Airtable = require('airtable');
const { IncomingWebhook } = require('@slack/webhook');
const controlCenterWebhook = new IncomingWebhook(process.env.slackControlCenterWebhookUrl);
const { respond, invokeFunctionSync } = require('serverless-helpers');

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.checkControlCenterEvents = async event => {
  console.log('yoooo');
  await controlCenterWebhook.send({
    text: "I've got news for you...",
  });
  return respond(200);
};
