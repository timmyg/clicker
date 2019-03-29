const dynamoose = require('dynamoose');
const { respond } = require('serverless-helpers');
const uuid = require('uuid/v1');

const User = dynamoose.model(
  process.env.tableUser,
  {
    id: {
      type: String,
      hashKey: true,
      default: uuid,
    },
    name: {
      type: String,
    },
    tokens: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
  },
);


module.exports.health = async event => {
  return respond();
};

module.exports.create = async event => {
  const body = getBody(event);
  const { name } = body;

  const initialTokens = 2;
  const user = await User.create(name, tokens: initialTokens);
  return respond(201, user);
};

module.exports.get = async event => {
  const { userid: id } = event.headers;

  const user = await User.queryOne('id')
    .eq(id)
    .exec();

  return respond(200, user);
};

module.exports.addTokens = async event => {
  const body = getBody(event);
  const { tokens } = body;
  const { userid: id } = event.headers;
  
  const updatedUser = await User.update({ id }, { $ADD: { tokens } }, { returnValues: 'ALL_NEW' });

  return respond(200, updatedUser);
};
