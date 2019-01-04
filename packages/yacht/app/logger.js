console.log('process.env.LOGZIO_TOKEN', process.env.LOGZIO_TOKEN);
const LogzioWinstonTransport = require('winston-logzio');
const winston = require('winston');

const addAppNameFormat = winston.format(info => {
  info.losantId = process.env.LOSANT_DEVICE_ID;
  return info;
});

const logzioWinstonTransport = new LogzioWinstonTransport({
  format: winston.format.combine(addAppNameFormat(), winston.format.json()),
  level: 'info',
  // rewriters: [
  //   (level, msg, meta) => {
  //     meta.app = process.env;
  //     return meta;
  //   },
  // ],
  token: process.env.LOGZIO_TOKEN,
});
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), logzioWinstonTransport],
});
module.exports = logger;
