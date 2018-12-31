const uuid = require('uuid');
const dynamoose = require('dynamoose');

const Device = dynamoose.model('Device', {
  id: Number,
  idSlug: String,
  losantId: String,
  createdAt: String,
  updatedAt: String,
});

/**
 * Registers a device if it has not been registered
 * @param   {string} losantId
 * @param   {string} idSlug
 *
 * @returns {number} 200, 201, 400
 */
module.exports.registerDevice = async event => {
  try {
    const timestamp = new Date().getTime();
    const body = JSON.parse(event.body);
    const { losantId, idSlug } = body;

    const newDevice = new Device({ id: uuid.v1(), idSlug, losantId, createdAt: timestamp, updatedAt: timestamp });
    const createdDevice = await newDevice.save();

    return { statusCode: 200, body: JSON.stringify({ createdDevice }) };
  } catch (e) {
    return { statusCode: 400, error: `Could not create: ${e.stack}` };
  }
};

module.exports.hello = async (event, context) => {
  try {
    const response = { event, context };
    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (e) {
    return { statusCode: 400, error: `error: ${e.stack}` };
  }
};
