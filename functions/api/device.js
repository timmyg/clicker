const dynamoose = require('dynamoose');
require('dotenv').config();

const Device = dynamoose.model(process.env.tableName, {
  id: {
    type: String,
    hashKey: true,
  },
  losantId: String,
});

/**
 * Registers a device if it has not been registered
 * @param   {string} losantId
 * @param   {string} slug
 *
 * @returns {number} 200, 201, 400
 */
module.exports.create = async event => {
  try {
    const timestamp = new Date().getTime();
    const body = JSON.parse(event.body);
    const { losantId, slug } = body;

    const newDevice = new Device({ slug, losantId, createdAt: timestamp, updatedAt: timestamp });
    console.info('creating device:');
    console.info(newDevice);
    const createdDevice = await newDevice.save();
    console.info({ createdDevice });

    return { statusCode: 200, body: JSON.stringify(createdDevice) };
  } catch (e) {
    console.error(e);
    return { statusCode: 400, error: `Could not create: ${e.stack}` };
  }
};

module.exports.all = async () => {
  try {
    const allDevices = await Device.scan().exec();
    console.info({ allDevices });

    return { statusCode: 200, body: JSON.stringify(allDevices) };
  } catch (e) {
    return { statusCode: 400, error: `Could not get all: ${e.stack}` };
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
