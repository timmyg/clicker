// @flow
require('dotenv').config();
const { respond, getBody, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const { IncomingWebhook } = require('@slack/webhook');
const stage = process.env.stage;

declare class process {
  static env: {
    stage: string,
    slackControlCenterWebhookUrl: string,
    slackAntennaWebhookUrl: string,
    slackAppWebhookUrl: string,
    slackLandingWebhookUrl: string,
  };
}

module.exports.sendApp = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackAppWebhookUrl);
  const { text, attachments } = getBody(event);
  await sendSlack(webhook, text, attachments);
  return respond(200);
});

module.exports.sendControlCenter = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackControlCenterWebhookUrl);
  const { text, attachments } = getBody(event);
  await sendSlack(webhook, text, attachments);
  return respond(200);
});

module.exports.sendAntenna = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackAntennaWebhookUrl);
  const { text, attachments } = getBody(event);
  await sendSlack(webhook, text, attachments);
  return respond(200);
});

module.exports.sendLanding = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackLandingWebhookUrl);
  const { text, attachments } = getBody(event);
  console.log(text, attachments, process.env.slackAntennaWebhookUrl, process.env.slackLandingWebhookUrl);
  await sendSlack(webhook, text, attachments);
  return respond(200);
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

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
