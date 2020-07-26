// @flow
const { respond, getBody, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const { Default, Entity, Table } = require('dynamodb-toolbox');
// const { DocumentClient } = require('aws-sdk/clients/dynamodb');
// const Entity = require('dynamodb-toolbox/classes/Entity');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const DocumentClient = new DynamoDB.DocumentClient();
const joi = require('joi');
const moment = require('moment');
const voucherTypes = {
  vip: 'vip',
  managerMode: 'manager-mode',
};

const VoucherTable = new Table({
  name: process.env.tableVoucher || 'table',
  partitionKey: 'code',
  sortKey: 'entityId',
  DocumentClient,
  indexes: {
    codeGlobalIndex: { partitionKey: 'code' },
  },
});
const Voucher = new Entity({
  name: 'Voucher',
  attributes: {
    code: { partitionKey: true },
    entityId: { hidden: false, sortKey: true },
    type: { type: 'string' },
    notes: { type: 'string' },
    expires: { type: 'string' },
  },
  table: VoucherTable,
});

module.exports.redeem = RavenLambdaWrapper.handler(Raven, async event => {
  const { code } = getBody(event);

  console.log(code);
  const voucher = await Voucher.query(code, { index: 'codeGlobalIndex' });
  console.log({ voucher });
  if (voucher.Items && !!voucher.Items.length) {
    const result = await Voucher.delete({ ...voucher.Items[0] });
    const { data } = await new Invoke()
      .service('user')
      .name('addRole')
      .body({ roleType: voucher.type, locationId: voucher.entityId })
      .headers(event.headers)
      .go();
    console.log({ data });
    return respond(200, 'voucher redeemed');
  }
  return respond(400, 'voucher not found');
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const schema = joi.object().keys({
    entityId: joi.string().required(),
    type: joi
      .string()
      .valid(...Object.values(voucherTypes))
      .required(),
    notes: joi.string().required(),
    count: joi.number().optional(),
    expiresDays: joi.number().optional(),
  });
  const { entityId, type, notes, count = 10, expiresDays } = getBody(event);
  const { error } = await schema.validate({ entityId, type, notes, count, expiresDays }, { abortEarly: false });
  if (error) {
    return respond(400, error.message);
  }
  let expires;
  if (!!expiresDays) {
    expires = moment()
      .add(expiresDays, 'days')
      .unix();
  }

  const vouchers: Voucher[] = [];

  for (let i of Array(count).keys()) {
    const voucher = {
      entityId,
      type,
      notes,
      code: createVoucherCode(),
      expires,
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
  var chars = '23456789abcdefghkmnopqrstuvwxyz'.split('');
  var charsLen = chars.length;
  if (!length) {
    length = ~~(Math.random() * charsLen);
  }
  for (var i = 0; i < length; i++) {
    str += chars[~~(Math.random() * charsLen)];
  }
  return str;
}
