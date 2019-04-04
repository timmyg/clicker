const { respond, getBody } = require('serverless-helpers');
const Trello = require('trello');
const trello = new Trello(process.env.trelloApiKey, process.env.trelloAuthToken);
const feedbackListId = '5ca63bb267270921fdb4af84';

// TODO test
// TODO prod only?
module.exports.create = async event => {
  const body = getBody(event);
  const { message } = body;
  const { userid: userId } = event.headers;
  const trelloCard = await createTrelloCard(message, userId);
  return respond(201, { trelloCard });
};

module.exports.health = async event => {
  return respond(200, `hello feedback`);
};

async function createTrelloCard(message, userId) {
  message = `${message}\n(from ${userId})`;
  var card = await trello.addCard('feedback', message, feedbackListId);
  return card;
}
