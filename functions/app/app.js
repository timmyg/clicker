require('dotenv').config();
const { respond } = require('serverless-helpers');
const plans = [
  { tokens: 2, dollars: 10, id: 'bb23310b-3fec-4873-8cdf-279ffcd31b32' },
  { tokens: 5, dollars: 20, id: '40167d6a-1626-456a-8a35-f60c91c05120' },
  { tokens: 10, dollars: 30, id: 'd25f930b-7c3a-4ea2-b41b-9ae959135c6a', best: true },
];

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.tokens = async event => {
  return respond(200, plans);
};
