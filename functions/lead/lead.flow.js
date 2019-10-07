// @flow
require('dotenv').config();
const { respond, getBody, Invoke } = require('serverless-helpers');
const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: process.env.hubspotApiKey });
const Trello = require('trello');
const trello = new Trello(process.env.trelloApiKey, process.env.trelloAuthToken);
const stage = process.env.stage;
const webSignupsListId = '5ca63bbb28858a47be1b5f9a';

module.exports.create = async (event: any) => {
  const body = getBody(event);
  const { email } = body;
  const text = `*New Landing Signup*: ${email}`;
  const invoke = new Invoke();
  await invoke
    .service('message')
    .name('sendLanding')
    .body({ text })
    .go();
  if (stage === 'prod') {
    const hubspotContact = await createHubspotContact(email);
    const trelloContact = await createTrelloCard(email);
    return respond(201, { hubspotContact, trelloContact });
  }
  return respond(201, "not prod so didn't actually create anything");
};

module.exports.health = async (event: any) => {
  return respond(200, `hello`);
};

async function createHubspotContact(email) {
  const contact = {
    properties: [{ property: 'email', value: email }, { property: 'source', value: 'landing page' }],
  };
  const hubspotContact = await hubspot.contacts.create(contact);
  return hubspotContact;
}

async function createTrelloCard(email) {
  const card = await trello.addCard(email, '', webSignupsListId);
  return card;
}
