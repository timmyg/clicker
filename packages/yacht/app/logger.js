const LogzioWinstonTransport = require('winston-logzio');
const winston = require('winston');

const logzioWinstonTransport = new LogzioWinstonTransport({
  level: 'info',
  token: process.env.LOGZIO_TOKEN,
});
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), logzioWinstonTransport],
});
module.exports = logger;
