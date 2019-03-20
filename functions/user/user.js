const { respond } = require('serverless-helpers');

//TODO
module.exports.health = async event => {
  return respond(200, `hello`);
};

//TODO
module.exports.register = async event => {
  // get user from token
  // create unless already created
  return respond(200, `hello`);
};

//TODO
module.exports.get = async event => {
  // get user from token
  // return user
  return respond(200, `hello`);
};

//TODO
module.exports.addTokens = async event => {
  // get user from token
  // get tokens amount from body
  // add tokens to user
  return respond(200, `hello`);
};
