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
    devices: [{ name: String, ip: String, mac: String }],
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

function generateResponse(statusCode, body = {}) {
  let msg = body;
  if (typeof msg === 'string') {
    msg = { message: msg };
  }
  return {
    statusCode,
    body: JSON.stringify(msg),
  };
}

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
    return generateResponse(201, createdDevice);
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not create: ${e.stack}`);
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
    return generateResponse(200, allDevices);
  } catch (e) {
    return generateResponse(400, `Could not list: ${e.stack}`);
  }
};

/**
 * Get device
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 *
 * @returns {number} 200, 400, 404
 */
module.exports.get = async event => {
  try {
    const { losantId } = event.pathParameters;
    const device = await Device.get({ losantId });
    if (device) {
      return generateResponse(200, device);
    }
    return generateResponse(404, `Device ${losantId} does not exist`);
  } catch (e) {
    return generateResponse(400, `Could not get: ${e.stack}`);
  }
};

/**
 * Get device DirecTV ip address
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 *
 * @returns {number} 200, 400, 404
 *
 * TODO, refactor, this is ugly
 */
module.exports.getIp = async event => {
  try {
    const { losantId } = event.pathParameters;
    const device = await Device.get({ losantId });
    if (!device) {
      return generateResponse(404, `Device ${losantId} does not exist`);
    }
    if (!device.devices || !device.devices.length) {
      return generateResponse(200, { ip: null });
    }
    const ips = device.devices.filter(d => new RegExp('directv', 'gi').test(d.name));
    if (ips && ips.length === 1) {
      const { ip } = ips[0];
      return generateResponse(200, { ip });
    }
    return generateResponse(200, { ips });
  } catch (e) {
    console.error(e.stack);
    return generateResponse(400, `Could not get ip: ${e.stack}`);
  }
};

/**
 * Update device
 * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
 * @param   {array} devices
 * @param   {object} options
 * @param   {object} version
 *
 * @returns {number} 200, 400
 */
module.exports.update = async event => {
  // TODO check if exists or else it creates!
  try {
    const { losantId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const updatedDevice = await Device.update({ losantId }, body);
    return generateResponse(200, updatedDevice);
  } catch (e) {
    return generateResponse(400, `Could not update: ${e.stack}`);
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
    return generateResponse(200, updatedDevice);
  } catch (e) {
    return generateResponse(400, `Could not delete: ${e.stack}`);
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
    return generateResponse(200, response);
  } catch (e) {
    return generateResponse(400, `error: ${e.stack}`);
  }
};
