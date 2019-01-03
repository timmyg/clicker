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
    boxes: [{ name: String, ip: String, mac: String }],
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
 * Registers a device if it has not been registered (losantId is PK)
 * @param   {string} losantId device identifier for Losant platform (event.body)
 * @param   {string} location human readable location for reference (event.body)
 *
 * @returns {number} 201, 400
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

/**
 * List of all registered devices
 *
 * @returns {number} 200, 400
 */
module.exports.list = async () => {
  try {
    const allDevices = await Device.scan().exec();
    return { statusCode: 200, body: JSON.stringify(allDevices) };
  } catch (e) {
    return { statusCode: 400, error: `Could not list: ${e.stack}` };
  }
};

/**
 * Get device
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 *
 * @returns {number} 200, 400
 */
module.exports.get = async event => {
  try {
    const { losantId } = event.pathParameters;
    const device = await Device.get({ losantId });
    return { statusCode: 200, body: JSON.stringify(device) };
  } catch (e) {
    return { statusCode: 400, error: `Could not get: ${e.stack}` };
  }
};

/**
 * Get device DirecTV ip address
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 *
 * @returns {number} 200, 400
 */
module.exports.getIp = async event => {
  try {
    const { losantId } = event.pathParameters;
    const device = await Device.get({ losantId });
    const ips = device.boxes.filter(d => new RegExp('directv', 'g').test(d.name));
    if (ips && ips.length === 1) {
      const { ip } = ips[0];
      return { statusCode: 200, body: JSON.stringify({ ip }) };
    }
    return { statusCode: 400, body: JSON.stringify({ ips }) };
  } catch (e) {
    return { statusCode: 400, error: `Could not get: ${e.stack}` };
  }
};

/**
 * Update device
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 * @param   {array} boxes
 * @param   {object} options
 * @param   {object} version
 *
 * @returns {number} 200, 400
 */
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

/**
 * Delete device
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 *
 * @returns {number} 200, 400
 */
module.exports.delete = async event => {
  try {
    const { losantId } = event.pathParameters;
    const updatedDevice = await Device.delete({ losantId });
    return { statusCode: 200, body: JSON.stringify(updatedDevice) };
  } catch (e) {
    return { statusCode: 400, error: `Could not delete: ${e.stack}` };
  }
};

/**
 * Hello world endpoint
 *
 * @returns {number} 200, 400
 */
module.exports.hello = async (event, context) => {
  try {
    const response = { event, context };
    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (e) {
    return { statusCode: 400, error: `error: ${e.stack}` };
  }
};
