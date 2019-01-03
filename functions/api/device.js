const dynamoose = require('dynamoose');
require('dotenv').config();

const Device = dynamoose.model(
  process.env.tableName,
  {
    losantId: {
      type: String,
      hashKey: true,
    },
    location: String,
    boxes: [Object],
    options: Object,
    version: Object,
    mode: Number,
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

/**
 * Registers a device if it has not been registered
 * @param   {string} losantId device identifier for Losant platform
 * @param   {string} location human readable location for reference
 *
 * @returns {number} 200, 201, 400
 */
module.exports.create = async event => {
  try {
    const body = JSON.parse(event.body);
    const { losantId, location } = body;
    const newDevice = new Device({ losantId, location });
    const createdDevice = await newDevice.save();
    return { statusCode: 201, body: JSON.stringify(createdDevice) };
  } catch (e) {
    console.error(e);
    return { statusCode: 400, error: `Could not create: ${e.stack}` };
  }
};

module.exports.list = async () => {
  try {
    const allDevices = await Device.scan().exec();
    return { statusCode: 200, body: JSON.stringify(allDevices) };
  } catch (e) {
    return { statusCode: 400, error: `Could not list: ${e.stack}` };
  }
};

module.exports.get = async event => {
  try {
    const { losantId } = event.pathParameters;
    const device = await Device.get({ losantId });
    return { statusCode: 200, body: JSON.stringify(device) };
  } catch (e) {
    return { statusCode: 400, error: `Could not get: ${e.stack}` };
  }
};

module.exports.update = async event => {
  try {
    const { losantId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const updatedDevice = await Device.update({ losantId }, body);
    return { statusCode: 200, body: JSON.stringify(updatedDevice) };
  } catch (e) {
    return { statusCode: 400, error: `Could not update: ${e.stack}` };
  }
};

module.exports.delete = async event => {
  try {
    const { losantId } = event.pathParameters;
    const updatedDevice = await Device.delete({ losantId });
    return { statusCode: 200, body: JSON.stringify(updatedDevice) };
  } catch (e) {
    return { statusCode: 400, error: `Could not delete: ${e.stack}` };
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
