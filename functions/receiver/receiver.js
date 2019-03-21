const dynamoose = require('dynamoose');
const { respond, getBody, getPathParameters } = require('serverless-helpers');
const uuid = require('uuid/v1');
require('dotenv').config({ path: '../.env' });

const Receiver = dynamoose.model(
  process.env.tableReceiver,
  {
    widgetId: { type: String, hashKey: true },
    id: {
      type: String,
      rangeKey: true,
      default: uuid,
    },
    ip: { type: String, required: true },
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

const Box = dynamoose.model(
  process.env.tableBox,
  {
    receiverId: {
      type: String,
      hashKey: true,
    },
    id: {
      type: String,
      rangeKey: true,
      default: uuid,
    },
    clientAddress: String, // dtv calls this clientAddr
    locationName: String, // dtv name
    label: String, // physical label id on tv
    setupChannel: Number,
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

module.exports.health = async event => {
  return respond(200, `hello`);
};

// TODO
module.exports.identify = async event => {
  const params = getPathParameters(event);
  const { id: receiverId } = params;
  const boxes = await Box.query('receiverId')
    .eq(receiverId)
    .exec();
  let setupChannel = 801; // first music channel
  for (const b of boxes) {
    console.log({ id: b.id }, { setupChannel });
    await Box.update({ id: b.id }, { setupChannel });
    setupChannel++;
    // TODO actually change channel with REMOTE
  }
  return respond(200, `hello`);
};

module.exports.getBoxes = async event => {
  // TODO need to get availability from reservations
  const params = getPathParameters(event);
  const { id: receiverId } = params;
  const allBoxes = await Box.scan('receiverId')
    .eq(receiverId)
    .exec();
  return respond(200, allBoxes);
};

module.exports.upsert = async event => {
  try {
    const body = getBody(event);
    const { ip, widgetId } = body;

    const receivers = await Receiver.scan('widgetId')
      .eq(widgetId)
      .exec();
    if (receivers && receivers.length) {
      const updatedReceiver = await Receiver.update({ id: receivers[0].id }, { ip }, { returnValues: 'ALL_NEW' });
      return respond(200, updatedReceiver);
    } else {
      const receiver = await Receiver.create({ widgetId, ip });
      return respond(201, receiver);
    }
  } catch (e) {
    return respond(400, `Could not create: ${e.stack}`);
  }
};

// // TODO
// module.exports.setIp = async event => {
//   // get receiver id/losant id from path
//   // set ip address
//   return respond(200, `hello`);
// };

module.exports.setBoxes = async event => {
  // TODO ensure dont accidentally overwrite labels
  const body = getBody(event);
  const params = getPathParameters(event);
  const { id: receiverId } = params;
  body.forEach(b => (b.receiverId = receiverId));
  await Box.batchPut(body);
  return respond(201, `hello`);
};

// TODO
module.exports.setLabels = async event => {
  const params = getPathParameters(event);
  const data = getBody(event);
  const { id: receiverId } = params;

  const boxes = await Box.scan('receiverId')
    .eq(receiverId)
    .exec();
  for (const d of data) {
    await Box.update({ id: b.id }, { setupChannel });
    setupChannel++;
    // TODO actually change channel with REMOTE
  }
  return respond(200, `hello`);
};
