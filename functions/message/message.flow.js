// @flow
require('dotenv').config();
const { respond, getBody } = require('serverless-helpers');
const { IncomingWebhook } = require('@slack/webhook');
const controlCenterWebhook = new IncomingWebhook(process.env.slackControlCenterWebhookUrl);
const antennaWebhook = new IncomingWebhook(process.env.slackAntennaWebhookUrl);
const appWebhook = new IncomingWebhook(process.env.slackAppWebhookUrl);
const stage = process.env.stage;

declare class process {
  static env: {
    stage: string,
    slackControlCenterWebhookUrl: string,
    slackAntennaWebhookUrl: string,
    slackAppWebhookUrl: string,
  };
}

module.exports.sendApp = async (event: any) => {
  const { text, attachments } = getBody(event);
  await sendSlack(appWebhook, text, attachments);
  return respond(200);
};

module.exports.sendControlCenter = async (event: any) => {
  const { text, attachments } = getBody(event);
  await sendSlack(controlCenterWebhook, text, attachments);
  return respond(200);
};

module.exports.sendAntenna = async (event: any) => {
  const { text, attachments } = getBody(event);
  await sendSlack(antennaWebhook, text, attachments);
  return respond(200);
};

module.exports.health = async (event: any) => {
  return respond(200, `hello`);
};

async function sendSlack(webhook, text, attachments) {
  const stage = `_${process.env.stage !== 'prod' ? process.env.stage : ''}_`;
  text = `${text} ${stage}`;
  if (attachments && attachments[0] && attachments[0].title) {
    attachments[0].title = `${attachments[0].title} ${stage}`;
  }
  await webhook.send({
    text,
    attachments,
  });
}
