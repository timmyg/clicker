require('dotenv').config();
const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: process.env.HUBSPOT_API_KEY });

function generateResponse(statusCode, body) {
  let msg = body;
  if (typeof msg === 'string') {
    msg = { message: msg };
  }
  return {
    statusCode,
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
  const contact = {
    properties: [{ property: 'email', value: email }],
  };
  const hubspotContact = await hubspot.contacts.create(contact);
  return generateResponse(201, hubspotContact);
};
