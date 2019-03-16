const { generateResponse } = require('serverless-helpers');

module.exports.health = async event => {
  return generateResponse(200, `hello feedback`);
};
