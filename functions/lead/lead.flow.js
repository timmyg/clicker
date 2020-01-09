// @flow
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: process.env.hubspotApiKey });
const Trello = require('trello');
const trello = new Trello(process.env.trelloApiKey, process.env.trelloAuthToken);
const stage = process.env.stage;
const webSignupsListId = '5ca63bbb28858a47be1b5f9a';



module.exports.create = RavenLambdaWrapper.handler(Raven, async (event) => {
	const body = getBody(event);
	const { email, emailBot1, emailBot2 } = body;
	const text = `*New Landing Signup*: ${email}`;
	console.log({ email, emailBot1, emailBot2 });
	if (emailBot1 !== 'dave' || emailBot2 !== 'matthews') {
		return respond(400, "i honestly think you're a bot");
	}
	console.time('notification');
	await new Invoke().service('notification').name('sendLanding').body({ text }).async().go();
	console.timeEnd('notification');
	if (stage === 'prod') {
		console.time('hubspot:create');
		const hubspotContact = await createHubspotContact(email);
		console.timeEnd('hubspot:create');
		console.time('trello:create');
		const trelloContact = await createTrelloCard(email);
		console.timeEnd('trello:create');
		return respond(201, { hubspotContact, trelloContact });
	}
	return respond(201, "not prod so didn't actually create anything");
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async (event) => {
	return respond(200, `hello`);
});

async function createHubspotContact(email) {
	const contact = {
		properties: [ { property: 'email', value: email }, { property: 'source', value: 'landing page' } ]
	};
	const hubspotContact = await hubspot.contacts.create(contact);
	return hubspotContact;
}

async function createTrelloCard(email) {
	const card = await trello.addCard(email, '', webSignupsListId);
	return card;
}



 