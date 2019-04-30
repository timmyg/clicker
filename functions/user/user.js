const dynamoose = require('dynamoose');
const { respond, getBody, getAuthBearerToken, getPathParameters, getUserId } = require('serverless-helpers');
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');

const Wallet = dynamoose.model(
  process.env.tableWallet,
  {
    userId: { type: String, hashKey: true, required: true },
    id: {
      type: String,
      // rangeKey: true,
      default: uuid,
    },
    tokens: {
      type: Number,
      required: true,
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
  console.log({ userId }, { tokens });

  const updatedWallet = await Wallet.update({ userId }, { $ADD: { tokens } }, { returnValues: 'ALL_NEW' });
  // const wallet = await Wallet.queryOne('userId')
  //   .eq(userId)
  //   .exec();

  return respond(200, updatedWallet);
};
