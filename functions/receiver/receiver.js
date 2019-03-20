const { respond } = require('serverless-helpers');
const uuid = require('uuid/v5');

const Receiver = dynamoose.model(
  process.env.tableReceiver,
  {
    id: {
      type: String,
      hashKey: true,
      default: uuid,
    },
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

const Box = dynamoose.model(
  process.env.tableBox,
  {
    id: {
      type: String,
      hashKey: true,
      default: uuid,
    },
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
  // check if receiver fully setup (ready = true ?)
  // get receiver id from path
  // get boxes
  // change channel of each box and save channel to box
  return respond(200, `hello`);
};

// TODO
module.exports.getBoxes = async event => {
  // get receiver id/losant id from path
  // need to get reservations to get availability
  // return boxes array with id/tag/available
  return respond(200, `hello`);
};

// TODO
module.exports.register = async event => {
  // get receiver id/losant id from path
  // upsert receiver
  return respond(200, `hello`);
};

// TODO
module.exports.setIp = async event => {
  // get receiver id/losant id from path
  // set ip address
  return respond(200, `hello`);
};

// TODO
module.exports.setBoxes = async event => {
  // get receiver id/losant id from path
  // get boxes from body
  // check if boxes already set (or ready = true ?)
  // set boxes if not
  return respond(200, `hello`);
};

// TODO
module.exports.setTags = async event => {
  // get receiver id/losant id from path
  // get boxes/tags array from body
  // loop through and set each box's tag
  return respond(200, `hello`);
};
