// @flow
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: process.env.hubspotApiKey });
const stage = process.env.stage;
const webSignupsListId = '5ca63bbb28858a47be1b5f9a';

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const body = getBody(event);
  const { email, emailBot1, emailBot2, promo } = body;
  let text = `*New Landing Signup*: ${email}`;
  if (promo) {
    text += ` [*promo*: ${promo}]`;
  }
  console.log({ email, emailBot1, emailBot2 });
  if (emailBot1 !== 'dave@dmb.com' || emailBot2 !== 'matthews@dmb.com') {
    return respond(400, "i honestly think you're a bot");
  }
  console.time('notification');
  await new Invoke()
    .service('notification')
    .name('sendLanding')
    .body({ text })
    .async()
    .go();
  console.timeEnd('notification');
  // if (stage === 'prod') {
  //   console.time('hubspot:create');
  //   const hubspotContact = await createHubspotContact(email, promo);
  //   console.timeEnd('hubspot:create');
  //   // console.time('trello:create');
  //   // const trelloContact = await createTrelloCard(email);
  //   // console.timeEnd('trello:create');
  //   return respond(201, { hubspotContact });
  // }
  return respond(201, "not prod so didn't actually create anything");
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

async function createHubspotContact(email: string, promo: string) {
  const properties = [
    { property: 'email', value: email },
    { property: 'source', value: 'landing page' },
  ];
  if (promo) {
    properties.push({ property: 'promo', value: promo });
  }
  const contact = {
    properties,
  };
  const hubspotContact = await hubspot.contacts.create(contact);
  return hubspotContact;
}

// async function createTrelloCard(email) {
//   const card = await trello.addCard(email, '', webSignupsListId);
//   return card;
// }
