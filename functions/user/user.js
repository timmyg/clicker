const dynamoose = require('dynamoose');
const { respond, getBody, getAuthBearerToken, getPathParameters } = require('serverless-helpers');
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');

const Wallet = dynamoose.model(
  process.env.tableWallet,
  {
    userId: { type: String, hashKey: true, required: true },
    id: {
      type: String,
      rangeKey: true,
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
  const userId = getAuthBearerToken(event);
  const user = await Wallet.queryOne('userId')
    .eq(id)
    .exec();
  return respond(200, user);
};

module.exports.addTokens = async event => {
  // const body = getBody(event);
  const { tokens } = body;
  const { userid: id } = event.headers;

  const updatedUser = await User.update({ id }, { $ADD: { tokens } }, { returnValues: 'ALL_NEW' });

  return respond(200, updatedUser);
};
