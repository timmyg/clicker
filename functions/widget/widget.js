const dynamoose = require('dynamoose');
const uuid = require('uuid/v1');
const { respond, getBody } = require('serverless-helpers');
require('dotenv').config({ path: '../.env' });

const Widget = dynamoose.model(
  process.env.tableWidget,
  {
    id: {
      type: String,
      hashKey: true,
      default: uuid,
    },
    losantId: {
      type: String,
    },
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

module.exports.health = async event => {
  return respond(200, `${process.env.serviceName}: i\'m good (table: ${process.env.tableWidget})`);
};

module.exports.register = async event => {
  try {
    const body = getBody(event);
    const { losantId } = body;

    const widgets = await Widget.scan('losantId')
      .eq(losantId)
      .exec();
    if (widgets && widgets.length) {
      return respond(200, widgets[0]);
    } else {
      const widget = await Widget.create({ losantId });
      return respond(201, widget);
    }
  } catch (e) {
    return respond(400, `Could not create: ${e.stack}`);
  }
};

// /**
//  * List of all registered devices
//  *
//  * @returns {number} 200, 400
//  */
// module.exports.list = async () => {
//   try {
//     const allDevices = await Widget.scan().exec();
//     return respond(200, allDevices);
//   } catch (e) {
//     return respond(400, `Could not list: ${e.stack}`);
//   }
// };

// /**
//  * Get device
//  * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
//  *
//  * @returns {number} 200, 400, 404
//  */
// module.exports.get = async event => {
//   try {
//     const { losantId } = event.pathParameters;
//     const device = await Widget.get({ losantId });
//     if (device) {
//       return respond(200, device);
//     }
//     return respond(404, `Device ${losantId} does not exist`);
//   } catch (e) {
//     return respond(400, `Could not get: ${e.stack}`);
//   }
// };

// /**
//  * Get device DirecTV ip address
//  * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
//  *
//  * @returns {number} 200, 400, 404
//  *
//  * TODO, refactor, this is ugly
//  */
// module.exports.getIp = async event => {
//   try {
//     const { losantId } = event.pathParameters;
//     const device = await Widget.get({ losantId });
//     if (!device) {
//       return respond(404, `Device ${losantId} does not exist`);
//     }
//     if (!device.devices || !device.devices.length) {
//       return respond(200, { ip: null });
//     }
//     const ips = device.devices.filter(d => new RegExp('directv', 'gi').test(d.name));
//     if (ips && ips.length === 1) {
//       const { ip } = ips[0];
//       return respond(200, { ip });
//     }
//     return respond(200, { ips });
//   } catch (e) {
//     console.error(e.stack);
//     return respond(400, `Could not get ip: ${e.stack}`);
//   }
// };

// /**
//  * Update device
//  * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
//  * @param   {array} devices
//  * @param   {object} options
//  * @param   {object} version
//  *
//  * @returns {number} 200, 400
//  */
// module.exports.update = async event => {
//   // TODO check if exists or else it creates!
//   try {
//     const { losantId } = event.pathParameters;
//     const body = JSON.parse(event.body);
//     const updatedDevice = await Widget.update({ losantId }, body);
//     return respond(200, updatedDevice);
//   } catch (e) {
//     return respond(400, `Could not update: ${e.stack}`);
//   }
// };

// /**
//  * Delete device
//  * @param   {string} losantId device identifier for Losant platform (event.pathParameters)
//  *
//  * @returns {number} 200, 400
//  */
// module.exports.delete = async event => {
//   try {
//     const { losantId } = event.pathParameters;
//     const updatedDevice = await Widget.delete({ losantId });
//     return respond(200, updatedDevice);
//   } catch (e) {
//     return respond(400, `Could not delete: ${e.stack}`);
//   }
// };

// /**
//  * Hello world endpoint
//  *
//  * @returns {number} 200, 400
//  */
// module.exports.hello = async (event, context) => {
//   try {
//     const response = { event, context };
//     return respond(200, response);
//   } catch (e) {
//     return respond(400, `error: ${e.stack}`);
//   }
// };

// // TODO
// // endpoint that changes all channels to music for setup
// // endpoint to map box identifiers to ids
// // endpoint to activate after setup is complete (location = active)
