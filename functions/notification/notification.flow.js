// @flow
const { respond, getBody, getUserId, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const { IncomingWebhook } = require('@slack/webhook');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const { stage } = process.env;

declare class process {
  static env: {
    stage: string,
    slackControlCenterWebhookUrl: string,
    slackManualZapsWebhookUrl: string,
    slackAntennaWebhookUrl: string,
    slackAppWebhookUrl: string,
    slackTasksWebhookUrl: string,
    slackLandingWebhookUrl: string,
    slackSandboxWebhookUrl: string,
    slackMoneyWebhookUrl: string,
  };
}

module.exports.sendApp = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackAppWebhookUrl);
  const { text } = getBody(event);
  const userId = getUserId(event);
  console.log({ text, userId });
  await sendSlack(webhook, text);
  return respond(200);
});

module.exports.sendControlCenter = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackControlCenterWebhookUrl);
  const { text } = getBody(event);
  await sendSlack(webhook, text);
  return respond(200);
});

module.exports.sendManual = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackManualZapsWebhookUrl);
  const { text } = getBody(event);
  await sendSlack(webhook, text);
  return respond(200);
});

module.exports.sendAntenna = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackAntennaWebhookUrl);
  const { text } = getBody(event);
  await sendSlack(webhook, text);
  return respond(200);
});

module.exports.sendLanding = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackLandingWebhookUrl);
  const { text } = getBody(event);
  console.log(text, process.env.slackAntennaWebhookUrl, process.env.slackLandingWebhookUrl);
  await sendSlack(webhook, text);
  return respond(200);
});

module.exports.sendTasks = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackTasksWebhookUrl);
  const { text, importance } = getBody(event);
  await sendSlack(webhook, text, importance);
  return respond(200);
});

module.exports.sendMoney = RavenLambdaWrapper.handler(Raven, async event => {
  const webhook = new IncomingWebhook(process.env.slackMoneyWebhookUrl);
  const { text } = getBody(event);
  await sendSlack(webhook, text);
  return respond(200);
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

async function sendSlack(webhook: any, text: string, importance?: number) {
  console.log(text, importance);
  let emoji;
  switch (importance) {
    case 1:
      emoji = ':bangbang:';
      break;
    case 2:
      emoji = ':exclamation:';
      break;
    default:
      break;
  }
  console.log({ emoji });
  const stageText = stage !== 'prod' ? `_${stage}_` : '';
  text = `${emoji ? `${emoji} ` : ''}${text} ${stageText}`;
  console.log({ text });

  if (stage === 'prod') {
    await webhook.send({
      text,
    });
  } else {
    const sandboxWebhook = new IncomingWebhook(process.env.slackSandboxWebhookUrl);
    await sandboxWebhook.send({
      text,
    });
  }
}
