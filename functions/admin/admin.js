require('dotenv').config();
const Airtable = require('airtable');
const { respond, invokeFunctionSync } = require('serverless-helpers');

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.checkControlCenterEvents = async event => {
  // const base = new Ai();
  console.log('yoooo');
  return respond(200);
};
