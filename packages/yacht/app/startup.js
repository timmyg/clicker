require('dotenv').config({ path: '../.captain.env' });
const { Device } = require('losant-mqtt');
const DirecTV = require('directv-remote');
const find = require('local-devices');
const winston = require('winston');
const LogzioWinstonTransport = require('winston-logzio');

const logzioWinstonTransport = new LogzioWinstonTransport({
  level: 'info',
  token: process.env.LOGZIO_TOKEN,
});
const logger = winston.createLogger({
  transports: [new winston.transports.Console(), logzioWinstonTransport],
});

// Construct Losant device.
const device = new Device({
  id: process.env.LOSANT_DEVICE_ID,
  key: process.env.LOSANT_KEY,
  secret: process.env.LOSANT_SECRET,
});

async function getDirectvIp() {
  const allDevices = await find();
  const dtvDevices = allDevices.filter(d => new RegExp('chromecast', 'g').test(d.name));
  if (dtvDevices && dtvDevices.length === 1) {
    const { ip } = dtvDevices[0];
    logger.info('got ip address', { ip });
    return ip;
  }
  logger.error('error getting directv ip address', { allDevices });
  throw Error();
}

async function onStartup() {
  try {
    const ip = await getDirectvIp();
    const Remote = new DirecTV.Remote(ip);
    // Listen for commands from Losant.
    device.on('command', command => {
      switch (command.name) {
        case 'tune':
          Remote.tune(command.channel, command.client, err => {
            if (err) return logger.error(err);
            return logger.info('tuned');
          });
          break;
        case 'key':
          Remote.tune(command.key, command.client, err => {
            if (err) return logger.error(err);
            return logger.info('keyed');
          });
          break;
        case 'command':
          Remote.processCommand(command.command, err => {
            if (err) return logger.error(err);
            return logger.info('command');
          });
          break;
        case 'channel.info':
          Remote.getProgInfo(command.channel, command.start, command.client, (err, response) => {
            if (err) return logger.error(err);
            return logger.info('channel.info', response);
          });
          break;
        case 'info.current':
          Remote.getTuned(command.client, (err, response) => {
            if (err) return logger.error(err);
            return logger.info('info.current', response);
          });
          break;
        case 'options':
          Remote.getOptions((err, response) => {
            if (err) return logger.error(err);
            return logger.info('options', response);
          });
          break;
        case 'locations':
          Remote.getLocations(command.type || 1, (err, response) => {
            if (err) return logger.error(err);
            return logger.info('locations', response);
          });
          break;
        case 'version':
          Remote.getVersion((err, response) => {
            if (err) return logger.error(err);
            return logger.info('version', response);
          });
          break;
        case 'mode':
          Remote.getMode(command.client, (err, response) => {
            if (err) return logger.error(err);
            return logger.info('mode', response);
          });
          break;
        default:
          break;
      }
    });
  } catch (e) {
    console.error(e);
  }
}

// Connect the device to Losant.
async function connect() {
  device.connect(error => {
    if (error) {
      logger.error(error);
      return;
    }
    logger.info(`${new Date()}: successfully connected!\n`);
    onStartup();
  });
}

connect();
