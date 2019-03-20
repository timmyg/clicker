const { respond, getBody } = require('serverless-helpers');
const Trello = require('trello');
const trello = new Trello(process.env.trelloApiKey, process.env.trelloAuthToken);
const feedbackListId = '5c8fd3a717571b6e37148786';

// TODO test
// TODO prod only?
module.exports.create = async event => {
  const body = getBody(event);
  const { message } = body;
  const trelloCard = await createTrelloCard(message);
  return respond(201, { trelloCard });
};

module.exports.health = async event => {
  return respond(200, `hello feedback`);
};

async function createTrelloCard(message) {
  var card = await trello.addCard('feedback', message, feedbackListId);
  return card;
}
