const dynamoose = require('dynamoose');
const { respond, getBody, getPathParameters, getUserId } = require('serverless-helpers');
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');

const Wallet = dynamoose.model(
  process.env.tableWallet,
  {
    userId: {
      type: String,
      hashKey: true,
      required: true,
      set: val => {
        return decodeURI(val).replace('sms|', '');
      },
    },
    id: {
      type: String,
      default: uuid,
    },
    tokens: {
      type: Number,
      required: true,
    },
    aliasedTo: {
      type: String,
      set: val => {
        return decodeURI(val).replace('sms|', '');
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports.health = async event => {
  return respond();
};

module.exports.create = async event => {
  // const body = getBody(event);
  const initialTokens = 2;
  const userId = uuid();
  await Wallet.create({ userId, tokens: initialTokens });
  const token = jwt.sign({ sub: userId, guest: true }, 'clikr');

  return respond(201, { token });
};

module.exports.getWallet = async event => {
  const userId = getUserId(event);
  console.log({ userId });
  const user = await Wallet.queryOne('userId')
    .eq(userId)
    .exec();
  return respond(200, { tokens: user.tokens });
};

module.exports.addTokens = async event => {
  const userId = getUserId(event);
  const { tokens } = getBody(event);
  const updatedWallet = await Wallet.update({ userId }, { $ADD: { tokens } }, { returnValues: 'ALL_NEW' });

  return respond(200, updatedWallet);
};

module.exports.alias = async event => {
  const { fromId, toId } = getPathParameters(event);

  // get existing users
  const fromUser = await Wallet.queryOne('userId')
    .eq(fromId)
    .exec();
  const toUser = await Wallet.queryOne('userId')
    .eq(toId)
    .exec();

  // count up new token total
  let tokens = fromUser.tokens;
  if (toUser) {
    tokens += toUser.tokens;
  }

  // create or update wallet
  let wallet;
  if (toUser) {
    wallet = await Wallet.update({ userId: toId }, { tokens });
  } else {
    wallet = await Wallet.create({ userId: toId, tokens });
  }

  await Wallet.update({ userId: fromId }, { aliasedTo: toId });
  return respond(201, wallet);
};
