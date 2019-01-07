const aws = require('aws-sdk');
const qs = require('qs');
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

async function callRemoteCommandFunction(channel, callback) {
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

  console.log('call lambda');
  lambda.invoke(opts, function(err, data) {
    console.log('lambda', err, data);
    if (err) {
      return console.error('error : ' + err);
    }
    return callback(err);
  });
}

function getTwilioMessageText(queryString) {
  console.log(qs.parse(queryString));
  return qs.parse(queryString).Body;
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
    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));
    const requestBody = event.body;
    const message = getTwilioMessageText(requestBody);
    console.log(message);
    if (message.includes('#gonoels')) {
      console.log('1');
      const channel = message.split(' ')[1];
      if (isNumber(channel)) {
        console.log('2');
        await callRemoteCommandFunction(parseInt(channel), err => {
          return generateResponse(200, 'cool');
        });
      }
    }
    return generateResponse(204, `invalid structure: ${message}`);
  } catch (e) {
    console.error(e);
    return generateResponse(400, `error - ${e.stack}`);
  }
};
