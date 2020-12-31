// @flow
const dynamoose = require('dynamoose');
const {
  respond,
  getBody,
  getPathParameters,
  getUserId,
  Invoke,
  Raven,
  RavenLambdaWrapper,
} = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const { stripeSecretKey } = process.env;
const stripe = require('stripe')(stripeSecretKey);
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const initialTokens = 1;
const key = 'clikr';
const demo = {
  phone: '+14141414141',
  code: '4141',
};
const voucherTypes = {
  vip: 'vip',
  managerMode: 'manager-mode',
};
declare class process {
  static env: {
    stage: string,
    stripeSecretKey: string,
    tableUser: string,
    twilioAccountSid: string,
    twilioAuthToken: string,
    twilioServiceSid: string,
    NODE_ENV: string,
  };
}

if (process.env.NODE_ENV === 'test') {
  dynamoose.AWS.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'test',
  });
}

const dbUser = dynamoose.model(
  process.env.tableUser,
  {
    id: {
      type: String,
      default: uuid,
      hashKey: true,
    },
    phone: {
      type: String,
      index: {
        global: true,
        project: false,
      },
    },
    referralCode: {
      type: String,
      index: {
        global: true,
        project: false,
      },
    },
    stripeCustomer: String,
    card: Object, // set in api
    referredByCode: String,
    lifetimeSpent: Number,
    lifetimeMinutes: Number,
    lifetimeZaps: Number,
    lifetimeTokens: Number,
    lifetimeTokenValue: Number,
    tokens: {
      type: Number,
      required: true,
    },
    // roles: {
    //   manageLocations: locationId[]
    //   vipLocations: locationId[]
    // }
    aliasedTo: {
      type: String,
    },
  },
  {
    saveUnknown: ['roles'],
    timestamps: true,
    allowEmptyArray: true,
  },
);

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  // Handle the event
  const webhookEvent = getBody(event);
  console.log({ webhookEvent });
  switch (webhookEvent.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = webhookEvent.data.object;
      break;
    case 'payment_method.attached':
      const paymentMethod = webhookEvent.data.object;
      break;
    default:
      return respond(400);
  }
});

module.exports.stripeWebhook = RavenLambdaWrapper.handler(Raven, async event => {
  const webhookEvent = getBody(event);
  console.log(JSON.stringify(webhookEvent));
  switch (webhookEvent.type) {
    case 'invoice.paid':
      const invoice = webhookEvent.data.object;
      const { customer_email: customerEmail, amount_paid: amountPaid } = invoice;
      const description = invoice.lines.data[0].description;
      const text = `Invoice Paid: ${customerEmail} $${amountPaid / 100} ${description}`;
      await new Invoke()
        .service('notification')
        .name('sendMoney')
        .body({ text })
        .async()
        .go();
      await new Invoke()
        .service('analytics')
        .name('track')
        .body({ userId: 'system', name: 'Invoice Paid', data: invoice })
        .async()
        .go();
      return respond(200);
    case 'invoice.payment_failed':
      const failedInvoice = webhookEvent.data.object;
      const { customer_email: failedCustomerEmail, id } = failedInvoice;
      const failedDescription = failedInvoice.lines.data[0].description;
      const failedText = `Invoice Failed :( ${failedCustomerEmail} ${failedDescription}: ${id}`;
      await new Invoke()
        .service('notification')
        .name('sendMoney')
        .body({ text: failedText })
        .async()
        .go();
      return respond(200);
    // case 'customer.subscription.created':
    //   const subscription = webhookEvent.data.object;
    //   const { customer } = subscription;
    //   const amountPaid = subscription.items.data[0].price.unit_amount;
    //   const text = `Subscription Created: ${customer} $${amountPaid / 100}`;
    //   await new Invoke()
    //     .service('notification')
    //     .name('sendMoney')
    //     .body({ text })
    //     .async()
    //     .go();
    //   return respond(200);
    default:
      return respond(400, `webhook ${webhookEvent.type} not supported by Clicker API`);
  }
});

module.exports.create = RavenLambdaWrapper.handler(Raven, async event => {
  const id = uuid();
  await dbUser.create({ id, tokens: initialTokens });
  const token = jwt.sign({ sub: id, guest: true }, key);

  return respond(201, { token });
});

module.exports.referral = RavenLambdaWrapper.handler(Raven, async event => {
  const { code } = getBody(event);
  // get user
  const userId = getUserId(event);
  const user = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();

  const referrerUser = await dbUser
    .queryOne('referralCode')
    .eq(code)
    .all()
    .exec();

  console.log({ user });
  console.log({ referrerUser });

  if (!referrerUser) {
    return respond(400, 'Sorry, invalid referral code', 'code.invalid');
  } else if (user.referredByCode) {
    return respond(400, 'Sorry, you have already been referred', 'user.redeemed');
  } else if (user.id === referrerUser.id) {
    return respond(400, 'Sorry, you cannot redeem your own code', 'user.same');
  }

  // add token to each user, save
  await dbUser.update({ id: userId }, { $ADD: { tokens: 1 } });
  await dbUser.update({ id: userId }, { referredByCode: code });
  await dbUser.update({ id: referrerUser.id }, { $ADD: { tokens: 1 } });

  const text = '*New referral*';
  await new Invoke()
    .service('notification')
    .name('sendApp')
    .body({ text })
    .async()
    .go();

  return respond(200);
});

module.exports.get = RavenLambdaWrapper.handler(Raven, async event => {
  const { id: userId } = getPathParameters(event);
  const user = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();
  return respond(200, user);
});

module.exports.wallet = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  let user = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();
  console.log({ user });

  // this shouldnt typically happen, but could in dev environments when database cleared
  if (!user) {
    // const userId = uuid();
    console.log('creating user', userId, initialTokens);
    user = await dbUser.create({ id: userId, tokens: initialTokens });
  }

  // generate referral code if none
  if (!user.referralCode) {
    const referralCode = Math.random()
      .toString(36)
      .substr(2, 5);
    user = await dbUser.update({ id: userId }, { referralCode }, { returnValues: 'ALL_NEW' });
  }

  console.log({ user });

  if (user.stripeCustomer) {
    const customer = await stripe.customers.retrieve(user.stripeCustomer);
    if (customer && customer.sources && customer.sources.data.length) {
      user.card = customer.sources.data[0];
    }
  }
  return respond(200, user);
});

module.exports.updateCard = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  const { token: stripeCardToken } = getBody(event);

  const user = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();

  if (user.stripeCustomer) {
    const customer = await stripe.customers.update(user.stripeCustomer, {
      source: stripeCardToken,
    });
    return respond(200, customer);
  } else {
    const customer = await stripe.customers.create({
      source: stripeCardToken,
      description: userId,
      phone: user.phone,
    });
    await dbUser.update({ id: userId }, { stripeCustomer: customer.id });
    return respond(201, customer);
  }
});

module.exports.removeCard = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);

  const { stripeCustomer } = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();

  const customer = await stripe.customers.retrieve(stripeCustomer);
  const cardToken = customer.sources.data[0].id;
  const response = await stripe.customers.deleteSource(stripeCustomer, cardToken);

  return respond(200, response);
});

module.exports.replenish = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  const plan = getBody(event);
  const user = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();

  const { dollars, tokens } = plan;

  console.log({ dollars, tokens });

  // charge via stripe
  const charge = await stripe.charges.create({
    amount: dollars * 100,
    currency: 'usd',
    customer: user.stripeCustomer,
  });
  console.log('1');

  // update user
  const updatedUser = await dbUser.update(
    { id: userId },
    { $ADD: { tokens, lifetimeTokens: tokens, lifetimeSpent: dollars } },
    { returnValues: 'ALL_NEW' },
  );
  console.log('2', updatedUser);

  // update tokenValue
  const tokenValue = getTokenValue(updatedUser);
  console.log({ updatedUser, tokenValue });
  const updatedUserWithCost = await dbUser.update(
    { id: userId },
    { lifetimeTokenValue: tokenValue },
    { returnValues: 'ALL_NEW' },
  );
  console.log('3', updatedUserWithCost);

  const text = `$${dollars} Added to Wallet! (${user.phone || '?'}, user: ${userId.substr(userId.length - 5)})`;
  await new Invoke()
    .service('notification')
    .name('sendApp')
    .body({ text })
    .async()
    .go();

  await new Invoke()
    .service('audit')
    .name('create')
    .body({
      type: 'user:wallet:replenished',
      entity: updatedUserWithCost,
    });

  return respond(200, updatedUserWithCost);
});

module.exports.charge = RavenLambdaWrapper.handler(Raven, async event => {
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
    receipt_email: email,
    amount: amount * 100,
    currency: 'usd',
  });

  console.log(charge);

  return respond(200, charge);
});

module.exports.subscribe = RavenLambdaWrapper.handler(Raven, async event => {
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
  const startTimestamp = ~~((start || Date.now()) / 1000);
  console.log({ startTimestamp });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    billing_cycle_anchor: startTimestamp,
    items: [{ plan }],
    prorate: false,
  });

  console.log(subscription);

  return respond(200, subscription);
});

module.exports.transaction = RavenLambdaWrapper.handler(Raven, async event => {
  const userId = getUserId(event);
  const { tokens, minutes } = getBody(event);
  let user = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();

  console.log({ user, tokens });
  if (user && user.tokens >= tokens) {
    user = await dbUser.update(
      { id: userId },
      { $ADD: { tokens: -tokens, lifetimeZaps: 1, lifetimeMinutes: minutes } },
      { returnValues: 'ALL_NEW' },
    );
    await new Invoke()
      .service('audit')
      .name('create')
      .body({
        type: 'user:transaction',
        entity: user,
      });
    return respond(200, user);
  } else {
    console.error('Insufficient Funds');
    return respond(400, 'Insufficient Funds');
  }
});

// not in use
module.exports.customerPortal = RavenLambdaWrapper.handler(Raven, async event => {
  const { stripeCustomerId } = getBody(event);

  var session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: 'https://tryclicker.com',
  });

  return respond(200, session);
});

module.exports.checkout = RavenLambdaWrapper.handler(Raven, async event => {
  const { priceId } = getBody(event);

  const host = event.headers.origin || 'http://tryclicker.com';
  var session = await stripe.checkout.sessions.create({
    // customer: stripeCustomerId,
    // return_url: 'https://tryclicker.com',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${host}/checkout/confirmation`,
    cancel_url: host,
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    subscription_data: {
      trial_period_days: 30,
    },
  });

  return respond(200, session);
});

module.exports.alias = RavenLambdaWrapper.handler(Raven, async event => {
  const { fromId, toId } = getPathParameters(event);

  // get existing users
  const fromUser = await dbUser
    .queryOne('id')
    .eq(fromId)
    .exec();
  const toUser = await dbUser
    .queryOne('id')
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
    user = await dbUser.update({ id: toId }, { tokens });
  } else {
    user = await dbUser.create({ id: toId, tokens });
  }
  // remove tokens from old account
  await dbUser.update({ id: fromId }, { tokens: 0 });

  // update for tracking purposes
  await dbUser.update({ id: fromId }, { aliasedTo: toId });

  // TODO update reservations to new user!

  await new Invoke()
    .service('audit')
    .name('create')
    .body({
      type: 'user:alias',
      entity: { fromUser, toUser },
    });

  return respond(201, user);
});

module.exports.verifyStart = RavenLambdaWrapper.handler(Raven, async event => {
  const { phone } = getBody(event);
  const { twilioAccountSid, twilioAuthToken, twilioServiceSid } = process.env;

  if (phone === demo.phone) {
    return respond(201);
  }

  try {
    const client = new twilio(twilioAccountSid, twilioAuthToken);
    const response = await client.verify.services(twilioServiceSid).verifications.create({ to: phone, channel: 'sms' });
    return respond(201, response);
  } catch (e) {
    return respond(400, e);
  }
});

module.exports.verify = RavenLambdaWrapper.handler(Raven, async event => {
  const { phone, code, uuid } = getBody(event);
  console.log({ phone, code, uuid });
  const { twilioAccountSid, twilioAuthToken, twilioServiceSid } = process.env;
  const client = new twilio(twilioAccountSid, twilioAuthToken);

  try {
    console.log(twilioAccountSid, twilioAuthToken, twilioServiceSid, phone, code);
    if (phone === demo.phone && code === demo.code) {
      const token = await getTokenDemo(phone);
      return respond(201, { token });
    }
    const result = await client.verify.services(twilioServiceSid).verificationChecks.create({ to: phone, code });
    console.log({ result });
    if (result.status === 'approved') {
      const token = await getToken(phone);
      return respond(201, { token });
    }
    return respond(400, 'denied');
  } catch (e) {
    console.error(e);
    return respond(400, e);
  }
});

module.exports.addRole = RavenLambdaWrapper.handler(Raven, async event => {
  const { roleType, locationId } = getBody(event);
  const userId = getUserId(event);
  const user = await dbUser
    .queryOne('id')
    .eq(userId)
    .exec();
  const role = getRole(roleType);
  let userRoles = user.roles;
  console.log({ role });
  if (!userRoles) {
    // doesnt have roles
    console.log('no roles');
    userRoles = {};
    userRoles[role] = [locationId];
  } else if (userRoles[role]) {
    console.log('has role');
    userRoles[role].push(locationId);
  } else {
    userRoles[role] = [locationId];
  }
  await dbUser.update({ id: userId }, { roles: userRoles });
  return respond(200, 'role added');
});

async function getTokenDemo(phone) {
  return await getToken(phone, true);
}

function getRole(id) {
  const map = {
    [voucherTypes.vip]: 'vipLocations',
    [voucherTypes.managerMode]: 'manageLocations',
  };
  return map[id];
}

async function getToken(phone, isDemo) {
  // if (isDemo) {
  //   return jwt.sign(
  //     {
  //       sub: uuid(),
  //     },
  //     key,
  //   );
  // }
  const demoTokens = 10;
  const user: User = await dbUser
    .queryOne('phone')
    .eq(phone)
    .all()
    .exec();
  if (user) {
    if (isDemo && user.tokens < demoTokens) {
      await dbUser.update({ id: user.id }, { tokens: demoTokens });
    }
    const { id } = user;
    return jwt.sign({ sub: id }, key);
  } else {
    const user = await dbUser.create({ phone, tokens: isDemo ? demoTokens : 0 });
    return jwt.sign({ sub: user.id }, key);
  }
}

function getTokenValue(user: User) {
  return Math.ceil((user.lifetimeSpent / user.lifetimeTokens) * 100) / 100;
}

module.exports.getTokenValue = getTokenValue;
