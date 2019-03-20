const { respond } = require('serverless-helpers');

module.exports.health = async event => {
  return respond(200, `hello`);
};
