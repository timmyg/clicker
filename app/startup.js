require('dotenv').config({ path: '../.captain.env' })
const Device = require('losant-mqtt').Device;
const winston = require('winston');
const LogzioWinstonTransport = require('winston-logzio');
const logzioWinstonTransport = new LogzioWinstonTransport({
  level: 'info',
  // name: 'winston_logzio',
  token: process.env.LOGZIO_TOKEN,
});
const logger = winston.createLogger({
    transports: [new winston.transports.Console(), logzioWinstonTransport]
});

// Construct Losant device.
var device = new Device({
  id: process.env.LOSANT_DEVICE_ID,
  key: process.env.LOSANT_KEY,
  secret: process.env.LOSANT_SECRET
});

// Connect the device to Losant.
device.connect(function (error) {
  if (error) {
    logger.error(error)
  }
  logger.info(new Date() + ': successfully connected!\n')
});

// Listen for commands from Losant.
device.on('command', function(command) {
  logger.info('Received a command:')
  logger.info(command)
});