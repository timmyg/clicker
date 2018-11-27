require('dotenv').config({ path: '../.captain.env' })
const Device = require('losant-mqtt').Device;
const DirecTV = require('directv-remote');
const find = require('local-devices')
const winston = require('winston');
const LogzioWinstonTransport = require('winston-logzio');
const logzioWinstonTransport = new LogzioWinstonTransport({
  level: 'info',
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
    return logger.error(error)
  }
  logger.info(new Date() + ': successfully connected!\n')
  onStartup()
});

async function onStartup() {
  try {
    const ip = await getDirectvIp()
    const Remote = new DirecTV.Remote(ipAddr)
    // Listen for commands from Losant.
    device.on('command', function(command) {
      switch (command.name) {
        case 'tune':
          Remote.tune(command.channel, command.client, function(err) {
            if (err) return logger.error(err);
          })
          break;
        case 'key':
          Remote.tune(command.key, command.client, function(err) {
            if (err) return logger.error(err);
          })
          break;
        case 'command':
          Remote.processCommand(command.command, function(err) {
            if (err) return logger.error(err);
          })
          break;
        case 'channel.info':
          Remote.getProgInfo(command.channel, channel.start, channel.client, function(err, response) {
            if (err) return logger.error(err);
            logger.info('info', response);
          })
          break;
        case 'info.current':
          Remote.getTuned(channel.client, function(err, response) {
            if (err) return logger.error(err);
            logger.info('info', response);
          })
          break;
        case 'options':
          Remote.getOptions(function(err,response) {
            if (err) return logger.error(err);
            logger.info('options', response);
          });
          break;
        case 'locations':
          Remote.getLocations(command.type || 1, function(err,response) {
            if (err) return logger.error(err);
            logger.info('locations', response);
          });
          break;
        case 'version':
          Remote.getVersion(function(err,response) {
            if (err) return logger.error(err);
            logger.info('version', response);
          });
          break;
        case 'mode':
          Remote.getMode(command.client, function(err,response) {
            if (err) return logger.error(err);
            logger.info('mode', response);
          });
          break;
        default:
          break;
      }
    });
  } catch (e) {}
}

async function getDirectvIp() {
  const allDevices = await find();
  const dtvDevices = allDevices.filter(device => new RegExp("chromecast", "g").test(device.name));
  if (dtvDevices && dtvDevices.length === 1) {
    const { ip } = dtvDevices[0]
    logger.info('got ip address', { ip })
    return ip
  } else {
    logger.error('error getting directv ip address', { allDevices })
    throw Error()
  }
}