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
    // userId: {
    //   type: String,
    //   hashKey: true,
    //   required: true,
    //   default: uuid,
    //   set: val => {
    //     return decodeURI(val).replace('sms|', '');
    //   },
    // },
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
      // set: val => {
      //   return decodeURI(val).replace('sms|', '');
      // },
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
  const id = uuid();
  await User.create({ id, tokens: initialTokens });
  const token = jwt.sign({ sub: id, guest: true }, key);

  return respond(201, { token });
};

module.exports.wallet = async event => {
  const userId = getUserId(event);
  let user = await User.queryOne('id')
    .eq(userId)
    .exec();
  console.log({ user });

  // this shouldnt typically happen, but could in dev environments when database cleared
  if (!user) {
    // const userId = uuid();
    console.log('creating user', userId, initialTokens);
    user = await User.create({ id: userId, tokens: initialTokens });
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

  const user = await User.queryOne('id')
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
      await User.update({ id: userId }, { stripeCustomer: customer.id });
      return respond(201, customer);
    }
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
};

module.exports.removeCard = async event => {
  const userId = getUserId(event);

  const { stripeCustomer } = await User.queryOne('id')
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
  const user = await User.queryOne('id')
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
  const updatedUser = await User.update({ id: userId }, { $ADD: { tokens } }, { returnValues: 'ALL_NEW' });

  return respond(200, updatedUser);
};

module.exports.charge = async event => {
  try {
    const { token, amount, email, company, name } = getBody(event);

    // create customer in stripe
    const customer = await stripe.customers.create({
      source: token,
      name: company,
      description: name,
      email,
    });

    console.log(customer);

    // charge via stripe
    const charge = await stripe.charges.create({
      customer: customer.id,
      amount: amount * 100,
      currency: 'usd',
    });

    console.log(charge);

    return respond(200, charge);
  } catch (e) {
    return respond(400, e);
  }
};

module.exports.subscribe = async event => {
  try {
    const { token, email, company, name, start, plan } = getBody(event);

    // create customer in stripe
    const customer = await stripe.customers.create({
      source: token,
      name: company,
      description: name,
      email,
    });

    console.log(customer);

    // create subscription via stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      billing_cycle_anchor: start / 1000 || ~~(Date.now() / 1000),
      items: [{ plan }],
      prorate: false,
    });

    console.log(subscription);

    return respond(200, subscription);
  } catch (e) {
    return respond(400, e);
  }
};

module.exports.transaction = async event => {
  const userId = getUserId(event);
  const { tokens } = getBody(event);
  const user = await User.queryOne('id')
    .eq(userId)
    .exec();

  if (user && user.tokens >= tokens) {
    // TODO audit
    user = await User.update({ id: userId }, { $ADD: { tokens: -tokens } }, { returnValues: 'ALL_NEW' });
    return respond(200, user);
  } else {
    console.error('Insufficient Funds');
    return respond(400, 'Insufficient Funds');
  }
};

module.exports.alias = async event => {
  const { fromId, toId } = getPathParameters(event);

  // get existing users
  const fromUser = await User.queryOne('id')
    .eq(fromId)
    .exec();
  const toUser = await User.queryOne('id')
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
    user = await User.update({ id: toId }, { tokens });
  } else {
    user = await User.create({ id: toId, tokens });
  }
  // remove tokens from old account
  await User.update({ id: fromId }, { tokens: 0 });

  // update for tracking purposes
  await User.update({ id: fromId }, { aliasedTo: toId });

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
    return respond(400, 'denied');
  } catch (e) {
    return respond(400, e);
  }
};

async function getToken(phone) {
  const users = await User.scan('phone')
    .eq(phone)
    .all()
    .exec();
  if (users && users.length) {
    const { id } = users[0];
    return jwt.sign({ sub: id }, key);
  } else {
    const user = await User.create({ phone, tokens: 0 });
    return jwt.sign({ sub: user.id }, key);
  }
}
