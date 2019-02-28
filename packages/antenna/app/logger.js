const LogzioWinstonTransport = require('winston-logzio');
const winston = require('winston');

const addAppNameFormat = winston.format(info => {
  const newInfo = info;
  newInfo.losantId = process.env.LOSANT_DEVICE_ID;
  return newInfo;
});

const logzioWinstonTransport = new LogzioWinstonTransport({
  format: winston.format.combine(addAppNameFormat(), winston.format.json()),
  level: 'info',
  token: process.env.LOGZIO_TOKEN,
});
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), logzioWinstonTransport],
});
module.exports = logger;
