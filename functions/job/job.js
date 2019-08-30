require('dotenv').config();

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.controlCenter = async event => {
  return respond(200, `hello`);
};
