const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const db = {
  tables: {
    devices: 'devices',
  },
};

/**
 * Registers a device if it has not been registered
 * @param   {string} losantId
 * @param   {string} idSlug
 *
 * @returns {number} 200, 201, 400
 */
module.exports.registerDevice = async event => {
  const timestamp = new Date().getTime();
  const body = JSON.parse(event.body);
  const { losantId, idSlug } = body;

  const params = {
    TableName: db.tables.devices,
    Item: {
      id: uuid.v1(),
      losantId,
      idSlug,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    const result = await dynamoDb.put(params).promise();
    return { statusCode: 200, body: JSON.stringify({ params, result }) };
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not put: ${error.stack}`,
    };
  }
};
