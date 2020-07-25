// @flow
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const { Default, Entity, Table } = require('dynamodb-toolbox');
// const { DocumentClient } = require('aws-sdk/clients/dynamodb');
// const Entity = require('dynamodb-toolbox/classes/Entity');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();
const joi = require('joi');

const VoucherTable = new Table({
  name: process.env.tableVoucher || 'table',
  partitionKey: 'code',
  sortKey: 'entityId',
  DocumentClient,
  indexes: {
    voucherGlobalIndex: { partitionKey: 'code' },
  },
});
const Voucher = new Entity({
  name: 'Voucher',
  attributes: {
    code: { partitionKey: true },
    entityId: { hidden: false, sortKey: true },
    type: { type: 'string' },
    notes: { type: 'string' },
  },
  table: VoucherTable,
});

module.exports.redeem = RavenLambdaWrapper.handler(Raven, async event => {
  const { code } = getBody(event);

  const voucher = await Voucher.get({ code });
  console.log({ voucher });
  // TODO redeem to user service
  const result = await Voucher.delete({ code });
  console.log({ result });
  return respond(200, result);
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const schema = joi.object().keys({
    entityId: joi.string().required(),
    type: joi
      .string()
      .valid('vip', 'manager-mode')
      .required(),
    notes: joi.string().required(),
    count: joi.number().optional(),
  });
  const { entityId, type, notes, count = 10 } = getBody(event);
  const { error } = await schema.validate({ entityId, type, notes, count }, { abortEarly: false });
  if (error) {
    return respond(400, error.message);
  }

  const vouchers: Voucher[] = [];

  for (let i of Array(count).keys()) {
    const voucher = {
      entityId,
      type,
      notes,
      code: createVoucherCode(),
    };
    console.log({ voucher });
    vouchers.push(VoucherTable.Voucher.putBatch(voucher));
  }
  const result = await VoucherTable.batchWrite(vouchers);
  console.log({ result });
  return respond(201, 'vouchers created');
});

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

function createVoucherCode(length = 5) {
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
