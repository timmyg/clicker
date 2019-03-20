const { respond } = require('serverless-helpers');
const uuid = require('uuid/v5');

const Reservation = dynamoose.model(
  process.env.tableReservation,
  {
    id: {
      type: String,
      hashKey: true,
      default: uuid,
    },
    location: {
      type: Object, // ?
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
module.exports.getAll = async event => {
  // get user
  // get all reservations for a user
  return respond(200, `hello`);
};

// TODO
module.exports.create = async event => {
  // get user
  // get from body (location, program, box, cost)
  // create reservation
  // change channel
  return respond(200, `hello`);
};

// TODO
module.exports.cancel = async event => {
  // get reservation id from path
  // update reservation to cancelled
  return respond(200, `hello`);
};

// TODO
module.exports.changeChannel = async event => {
  // get reservation id from path
  // update reservation channel
  // change channel
  return respond(200, `hello`);
};

// TODO
module.exports.changeTime = async event => {
  // get reservation id from path
  // update reservation end time
  return respond(200, `hello`);
};
