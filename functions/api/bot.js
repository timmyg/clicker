const aws = require('aws-sdk');
require('dotenv').config();

function generateResponse(statusCode, body) {
  let msg = body;
  if (typeof msg === 'string') {
    msg = { message: msg };
  }
  return {
    statusCode,
    body: JSON.stringify(msg),
  };
}

function isNumber(str) {
  return !isNaN(str);
}

function callRemoteCommandFunction(channel) {
  var lambda = new aws.Lambda();
  var opts = {
    FunctionName: 'serverless-api-with-dynamodb-prod-remoteCommand',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      pathParameters: {
        losantId: '5bf8677684a2990008742e14',
      },
      name: 'tune',
      payload: {
        channel,
      },
    }),
  };

  lambda.invoke(opts, function(err, data) {
    if (err) {
      console.log('error : ' + err);
      callback(err, null);
    } else if (data) {
      const response = {
        statusCode: 200,
        body: JSON.parse(data.Payload),
      };
      callback(null, response);
    }
  });
}

/**
 * Handles sms incoming webhook from twilio
 * @param   {string} losantId device identifier for Losant platform (event.body)
 * @param   {string} location human readable location for reference (event.body)
 *
 * @returns {number} 201, 400
 */
module.exports.smsIncoming = async (event, context) => {
  try {
    // console.log(JSON.stringify(event));
    // console.log(JSON.stringify(context));
    const requestBody = event.body;
    const fields = JSON.parse(
      '{"' +
        decodeURI(requestBody)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"') +
        '"}',
    );
    console.log({ fields });
    const message = fields.Body;
    if (message.includes('#gonoels')) {
      const channel = message.split(' ')[1];
      if (isNumber(channel)) {
        callRemoteCommandFunction(parseInt(channel));
        return generateResponse(200, 'cool');
      }
    }
    return generateResponse(204, `invalid structure: ${message}`);
  } catch (e) {
    console.error(e);
    return generateResponse(400, `error - ${e.stack}`);
  }
};
