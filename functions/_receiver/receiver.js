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
    ip: { type: String },
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

module.exports.upsert = async event => {
  try {
    const body = getBody(event);
    const { ip, widgetId } = body;
    console.log(ip, widgetId);
    const receiver = await Receiver.queryOne('widgetId')
      .eq(widgetId)
      .exec();
    console.log(receiver);
    if (receiver) {
      const updatedReceiver = await Receiver.update({ id: receiver.id }, { ip }, { returnValues: 'ALL_NEW' });
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
