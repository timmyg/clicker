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
  sortKey: 'entityId',
  DocumentClient,
});
const Voucher = new Entity({
  name: 'Voucher',
  attributes: {
    voucher: { partitionKey: true },
    entityId: { hidden: false, sortKey: true },
    type: { type: 'string' },
    notes: { type: 'string' },
  },
  table: VoucherTable,
});


module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { entityId, type, count = 10, notes } = getBody(event);

  const vouchers: Voucher[] = [];
  for (let i of Array(count).keys()) {
    vouchers.push(
      VoucherTable.Voucher.putBatch({
        entityId,
        type,
        notes,
        voucher: createVoucher(),
      }),
    );
  }
  const result = await VoucherTable.batchWrite(vouchers);
  console.log({ result });
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
