const DirecTV = require('directv-remote');
const find = require('local-devices');
const { Device } = require('losant-mqtt');
const logger = require('./logger');
const Api = require('./api');

class Widget {
  constructor() {
    this.device = new Device({
      id: process.env.LOSANT_DEVICE_ID,
      key: process.env.LOSANT_KEY,
      secret: process.env.LOSANT_SECRET,
    });
    this.id = process.env.LOSANT_DEVICE_ID;
    this.remote = null;
    this.api = new Api();
    this.init();
  }

  async saveDevices() {
    logger.info('finding devices');
    const devices = await find();
    logger.info('found devices', { devices });
    // boxes[0].name = 'aa-direCTv-23429048';
    // boxes[0].ip = '127.0.0.1';
    await this.api.updateDevice(this.id, { devices });
  }

  async saveBoxes() {
    const boxes = this.remote.getLocations((err, response) => {
      if (err) return logger.error(err);
      logger.info({ boxes: response });
      return this.api.updateDevice(this.id, { boxes });
    });
  }

  async initListeners() {
    try {
      const result = await this.api.getDeviceDirectvIp(this.id);
      if (result && result.ip) {
        const { ip } = result;
        this.remote = new DirecTV.Remote(ip);
        DirecTV.validateIP(result.ip, error => {
          if (error) {
            logger.error(`not valid directv ip: ${ip}`);
            logger.error(error);
          }
          logger.info(`valid directv ip: ${ip}`);
          this.saveBoxes();
        });
      } else {
        logger.error('no valid dtv ip');
      }
      // Listen for commands from Losant
      this.device.on('command', command => {
        logger.info({ command });
        switch (command.name) {
          case 'tune':
            this.remote.tune(command.channel, command.client, err => {
              if (err) return logger.error(err);
              return logger.info('tuned');
            });
            break;
          case 'key':
            this.remote.tune(command.key, command.client, err => {
              if (err) return logger.error(err);
              return logger.info('keyed');
            });
            break;
          case 'command':
            this.remote.processCommand(command.command, err => {
              if (err) return logger.error(err);
              return logger.info('command');
            });
            break;
          case 'channel.info':
            this.remote.getProgInfo(command.channel, command.start, command.client, (err, response) => {
              if (err) return logger.error(err);
              return logger.info('channel.info', response);
            });
            break;
          case 'info.current':
            this.remote.getTuned(command.client, (err, response) => {
              if (err) return logger.error(err);
              return logger.info('info.current', response);
            });
            break;
          case 'options':
            this.remote.getOptions((err, response) => {
              if (err) return logger.error(err);
              return logger.info('options', response);
            });
            break;
          case 'locations':
            this.remote.getLocations(command.type || 1, (err, response) => {
              if (err) return logger.error(err);
              return logger.info('locations', response);
            });
            break;
          case 'version':
            this.remote.getVersion((err, response) => {
              if (err) return logger.error(err);
              return logger.info('version', response);
            });
            break;
          case 'mode':
            this.remote.getMode(command.client, (err, response) => {
              if (err) return logger.error(err);
              return logger.info('mode', response);
            });
            break;
          case 'health':
            return logger.info('healthy');
          default:
            break;
        }
      });
    } catch (e) {
      logger.error(e);
    }
  }

  /*
   * 1. save local ips off to api
   * 2. connect to losant
   * 3. get directv api from api
   * 4. listen for commands
   */
  async init() {
    await this.api.registerDevice(this.id);
    this.saveDevices();
    this.device.connect(error => {
      if (error) {
        logger.error(error);
        return;
      }
      logger.info(`successfully connected!`);
      this.initListeners();
    });
  }
}

module.exports = Widget;
