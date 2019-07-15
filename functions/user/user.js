const dynamoose = require('dynamoose');
const { respond, getBody, getPathParameters, getUserId } = require('serverless-helpers');
const { stripeSecretKey } = process.env;
const stripe = require('stripe')(stripeSecretKey);
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');
const initialTokens = 2;
const key = 'clikr';

const User = dynamoose.model(
  process.env.tableUser,
  {
    userId: {
      type: String,
      hashKey: true,
      required: true,
      default: uuid,
      set: val => {
        return decodeURI(val).replace('sms|', '');
      },
    },
    id: {
      type: String,
      default: uuid,
    },
    stripeCustomer: String,
    phone: String,
    card: Object, // set in api
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
  const userId = uuid();
  await User.create({ userId, tokens: initialTokens });
  const token = jwt.sign({ sub: userId, guest: true }, key);

  return respond(201, { token });
};

module.exports.wallet = async event => {
  const userId = getUserId(event);
  let user = await User.queryOne('userId')
    .eq(userId)
    .exec();
  console.log({ user });

  // this shouldnt typically happen, but could in dev environments when database cleared
  if (!user) {
    // const userId = uuid();
    console.log('creating user', userId, initialTokens);
    user = await User.create({ userId, tokens: initialTokens });
  }
  console.log({ user });

  if (user.stripeCustomer) {
    const customer = await stripe.customers.retrieve(user.stripeCustomer);
    if (customer && customer.sources && customer.sources.data.length) {
      user.card = customer.sources.data[0];
    }
  }
  return respond(200, user);
};

module.exports.updateCard = async event => {
  const userId = getUserId(event);
  const { token: stripeCardToken } = getBody(event);

  const user = await User.queryOne('userId')
    .eq(userId)
    .exec();

  try {
    if (user.stripeCustomer) {
      const customer = await stripe.customers.update(user.stripeCustomer, {
        source: stripeCardToken,
      });
      return respond(200, customer);
    } else {
      const customer = await stripe.customers.create({
        source: stripeCardToken,
        description: userId,
      });
      // TODO audit
      await User.update({ userId }, { stripeCustomer: customer.id });
      return respond(201, customer);
    }
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.removeCard = async event => {
  const userId = getUserId(event);

  const { stripeCustomer } = await User.queryOne('userId')
    .eq(userId)
    .exec();

  const customer = await stripe.customers.retrieve(stripeCustomer);
  const cardToken = customer.sources.data[0].id;
  const response = await stripe.customers.deleteSource(stripeCustomer, cardToken);

  return respond(200, response);
};

module.exports.replenish = async event => {
  const userId = getUserId(event);
  const plan = getBody(event);
  const user = await User.queryOne('userId')
    .eq(userId)
    .exec();
  // TODO audit plan

  const { dollars, tokens } = plan;

  // charge via stripe
  const charge = await stripe.charges.create({
    amount: dollars * 100,
    currency: 'usd',
    customer: user.stripeCustomer,
  });

  // TODO audit

  // update user
  const updatedUser = await User.update({ userId }, { $ADD: { tokens } }, { returnValues: 'ALL_NEW' });

  return respond(200, updatedUser);
};

module.exports.transaction = async event => {
  const userId = getUserId(event);
  const { tokens } = getBody(event);
  const user = await User.queryOne('userId')
    .eq(userId)
    .exec();

  if (user && user.tokens >= tokens) {
    // TODO audit
    user = await User.update({ userId }, { $ADD: { tokens: -tokens } }, { returnValues: 'ALL_NEW' });
    return respond(200, user);
  } else {
    console.error('Insufficient Funds');
    return respond(400, 'Insufficient Funds');
  }
};

module.exports.alias = async event => {
  const { fromId, toId } = getPathParameters(event);

  // get existing users
  const fromUser = await User.queryOne('userId')
    .eq(fromId)
    .exec();
  const toUser = await User.queryOne('userId')
    .eq(toId)
    .exec();

  // count up new token total
  let tokens = fromUser.tokens;
  if (toUser) {
    tokens += toUser.tokens;
  }

  // create or update user
  let user;
  if (toUser) {
    user = await User.update({ userId: toId }, { tokens });
  } else {
    user = await User.create({ userId: toId, tokens });
  }
  // remove tokens from old account
  await User.update({ userId: fromId }, { tokens: 0 });

  // update for tracking purposes
  await User.update({ userId: fromId }, { aliasedTo: toId });

  // TODO update reservations to new user!

  // TODO audit transaction

  return respond(201, user);
};

module.exports.verifyStart = async event => {
  const { phone } = getBody(event);
  const { twilioAccountSid, twilioAuthToken, twilioServiceSid } = process.env;
  const client = require('twilio')(twilioAccountSid, twilioAuthToken);

  try {
    const response = await client.verify.services(twilioServiceSid).verifications.create({ to: phone, channel: 'sms' });
    console.log(response);
    return respond(201, response);
  } catch (e) {
    return respond(400, e);
  }
};

module.exports.verify = async event => {
  const { phone, code } = getBody(event);
  const { twilioAccountSid, twilioAuthToken, twilioServiceSid } = process.env;
  const client = require('twilio')(twilioAccountSid, twilioAuthToken);

  try {
    const result = await client.verify.services(twilioServiceSid).verificationChecks.create({ to: phone, code });
    console.log(result);
    if (result.status === 'approved') {
      const token = await getToken(phone);
      return respond(201, { token });
    }
    return respond(201, 'denied');
  } catch (e) {
    return respond(400, e);
  }
};

async function getToken(phone) {
  //   // check if phone number
  const users = await User.scan('phone')
    .eq(phone)
    .all()
    .exec();
  console.log(users);
  console.log(key);
  if (users && users.length) {
    const { userId } = users[0];
    return jwt.sign({ sub: userId }, key);
  } else {
    console.log('1');
    const user = await User.create({ tokens: initialTokens });
    console.log('2', user);
    return jwt.sign({ sub: user.userId }, key);
  }
}
