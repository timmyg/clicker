// @flow
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const { Model } = require('dynamodb-toolbox');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();

const Voucher = new Model('Voucher', {
  table: process.env.tableVoucher,
  partitionKey: 'voucher',
  sortKey: 'locationId',
  schema: {
    voucher: { type: 'string', alias: 'id' },
    locationId: { type: 'string' },
    type: { type: 'string' },
  },
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const { locationId, type, count = 10 } = getBody(event);
  const vouchers: Voucher[] = [];
  for (let i of Array(count).keys()) {
    const voucher = createVoucher();
    vouchers.push(
      Voucher.putBatch({
        locationId,
        type,
        voucher,
      }),
    );
  }

  const result = await Voucher.batchWrite(
    vouchers,
    //   , {
    //   capacity: 'total',
    //   metrics: 'size',
    // }
  );

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
