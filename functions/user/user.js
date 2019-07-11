const dynamoose = require('dynamoose');
const { respond, getBody, getPathParameters, getUserId } = require('serverless-helpers');
const { stripeSecretKey } = process.env;
const stripe = require('stripe')(stripeSecretKey);
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');
const initialTokens = 2;

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
    stripeCustomer: String,
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
  await Wallet.create({ userId, tokens: initialTokens });
  const token = jwt.sign({ sub: userId, guest: true }, 'clikr');

  return respond(201, { token });
};

module.exports.wallet = async event => {
  const userId = getUserId(event);
  let wallet = await Wallet.queryOne('userId')
    .eq(userId)
    .exec();
  console.log({ wallet });

  // this shouldnt typically happen, but could in dev environments when database cleared
  if (!wallet) {
    // const userId = uuid();
    console.log('creating wallet', userId, initialTokens);
    wallet = await Wallet.create({ userId, tokens: initialTokens });
  }
  console.log({ wallet });

  if (wallet.stripeCustomer) {
    const customer = await stripe.customers.retrieve(wallet.stripeCustomer);
    if (customer && customer.sources && customer.sources.data.length) {
      wallet.card = customer.sources.data[0];
    }
  }
  return respond(200, wallet);
};

module.exports.updateCard = async event => {
  const userId = getUserId(event);
  const { token: stripeCardToken } = getBody(event);

  const wallet = await Wallet.queryOne('userId')
    .eq(userId)
    .exec();

  try {
    if (wallet.stripeCustomer) {
      const customer = await stripe.customers.update(wallet.stripeCustomer, {
        source: stripeCardToken,
      });
      return respond(200, customer);
    } else {
      const customer = await stripe.customers.create({
        source: stripeCardToken,
        description: userId,
      });
      // TODO audit
      await Wallet.update({ userId }, { stripeCustomer: customer.id });
      return respond(201, customer);
    }
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.removeCard = async event => {
  const userId = getUserId(event);

  const { stripeCustomer } = await Wallet.queryOne('userId')
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
  const wallet = await Wallet.queryOne('userId')
    .eq(userId)
    .exec();
  // TODO audit plan

  const { dollars, tokens } = plan;

  // charge via stripe
  const charge = await stripe.charges.create({
    amount: dollars * 100,
    currency: 'usd',
    customer: wallet.stripeCustomer,
  });

  // TODO audit

  // update wallet
  const updatedWallet = await Wallet.update({ userId }, { $ADD: { tokens } }, { returnValues: 'ALL_NEW' });

  return respond(200, updatedWallet);
};

module.exports.transaction = async event => {
  const userId = getUserId(event);
  const { tokens } = getBody(event);
  const wallet = await Wallet.queryOne('userId')
    .eq(userId)
    .exec();

  if (wallet && wallet.tokens >= tokens) {
    // TODO audit
    wallet = await Wallet.update({ userId }, { $ADD: { tokens: -tokens } }, { returnValues: 'ALL_NEW' });
    return respond(200, wallet);
  } else {
    console.error('Insufficient Funds');
    return respond(400, 'Insufficient Funds');
  }
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
  // remove tokens from old account
  await Wallet.update({ userId: fromId }, { tokens: 0 });

  // update for tracking purposes
  await Wallet.update({ userId: fromId }, { aliasedTo: toId });

  // TODO update reservations to new user!

  // TODO audit transaction

  return respond(201, wallet);
};
