require('dotenv').config();
const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: process.env.HUBSPOT_API_KEY });
const Trello = require('trello');
const trello = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_AUTH_TOKEN);
const stage = process.env.stage;
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function generateResponse(statusCode, body) {
  let msg = body;
  if (typeof msg === 'string') {
    msg = { message: msg };
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(msg),
  };
}
 

/**
 * Handles sms incoming webhook from twilio
 * @param   {string} losantId device identifier for Losant platform (event.body)
 * @param   {string} location human readable location for reference (event.body)
 *
 * @returns {number} 201, 400
 */
module.exports.new = async (event, context) => {
  const body = JSON.parse(event.body);
  const { email } = body;
  if (stage === 'prod') {
    const hubspotContact = await createHubspotContact(email);
    const trelloContact = await createTrelloCard(email);
    return generateResponse(201, { hubspotContact, trelloContact });
  }
  return generateResponse(201, "not prod so didn't actually create anything");
};

async function createHubspotContact(email) {
  const contact = {
    properties: [{ property: 'email', value: email }, { property: 'source', value: 'landing page' }],
  };
  const hubspotContact = await hubspot.contacts.create(contact);
  return hubspotContact;
}

async function createTrelloCard(email) {
  const webSignupsList = '5c5dd0800e00da44c0fadb1e';
  var card = await trello.addCard(email, '', webSignupsList);
  console.log({ card });
  // addDueDateToCard
  return card;
}

module.exports.health = async event => {
  return generateResponse(200, `hello`);
};
