// @flow
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const { Default, Entity, Table } = require('dynamodb-toolbox');
// const { DocumentClient } = require('aws-sdk/clients/dynamodb');
// const Entity = require('dynamodb-toolbox/classes/Entity');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const VoucherTable = new Table({
  name: process.env.tableVoucher || 'table',
  partitionKey: 'voucher',
  sortKey: 'locationId',
  DocumentClient,
  // schema: {
  //   voucher: { type: 'string', alias: 'id' },
  //   locationId: { type: 'string' },
  //   type: { type: 'string' },
  // },
});
const Voucher = new Entity({
  // Specify entity name
  name: 'Voucher',

  // Define attributes
  attributes: {
    voucher: { partitionKey: true }, // flag as partitionKey
    locationId: { hidden: false, sortKey: true }, // flag as sortKey and mark hidden
    type: { type: 'string' }, // set the attribute type
  },

  // Assign it to our table
  table: VoucherTable,
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, type, count = 10 } = getBody(event);
  console.log(process.env.tableVoucher);
  for (let i of Array(count).keys()) {
    const voucher = createVoucher();
    let result = await Voucher.put({ locationId, type, voucher });
    console.log({ result });
  }
  // const vouchers: Voucher[] = [];
  // for (let i of Array(count).keys()) {
  //   const voucher = createVoucher();
  //   vouchers.push(
  //     VoucherTable.Voucher.putBatch({
  //       locationId,
  //       category,
  //       voucher,
  //     }),
  //   );
  // }
  // const result = await VoucherTable.batchWrite(vouchers);
  // console.log({ result });
  return respond(201, 'vouchers created');
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

function createVoucher(length = 5) {
  var str = '';
  var chars = '23456789abcdefghiklmnopqrstuvwxyz'.split('');
  var charsLen = chars.length;
  if (!length) {
    length = ~~(Math.random() * charsLen);
  }
  for (var i = 0; i < length; i++) {
    str += chars[~~(Math.random() * charsLen)];
  }
  return str;
}
