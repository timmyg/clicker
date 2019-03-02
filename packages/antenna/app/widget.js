const DirecTV = require('directv-remote');
const { Device } = require('losant-mqtt');
const logger = require('./logger');
const Api = require('./api');
const arpScanner = require('arpscan-new');

class Widget {
  constructor() {
    this.device = new Device({
      id: process.env.LOSANT_DEVICE_ID,
      key: process.env.LOSANT_KEY,
      secret: process.env.LOSANT_SECRET,
    });
    this.id = this.device.id;
    this.remote = null;
    this.api = new Api(this.id);
    this.init();
  }

  async saveIp() {
    logger.info('about to save ips....');
    // const localDevices = await arpScanner();
    arpScanner((err, localDevices) => {
      if (err) logger.error(err);
      logger.info({ localDevices });
      const ips = localDevices.map(device => device.ip);
      logger.info({ ips });
      ips.forEach(ip => {
        DirecTV.validateIP(ip, error => {
          if (error) {
            return logger.info(`.......... not valid directv ip: ${ip}`);
          }
          logger.info(`*#$&%~%*$& valid directv ip: ${ip}`);
          this.saveBoxes(ip);
          return this.api.updateDeviceDirectvIp(ip);
        });
      });
    });
  }

  async saveBoxes(ip) {
    const remote = new DirecTV.Remote(ip);
    const boxes = remote.getLocations((err, response) => {
      if (err) return logger.error(err);
      logger.info({ boxes: response });
      return this.api.updateDeviceBoxes(boxes);
    });
  }

  async initListeners() {
    try {
      // Listen for commands from Losant
      this.device.on('command', command => {
        logger.info({ command });
        // const ip = '192.168.200.221';
        const { name, payload } = command;
        const { ip } = payload;
        console.log({ ip, name, payload });
        this.remote = new DirecTV.Remote(ip);
        switch (name) {
          case 'tune':
            this.remote.tune(payload.channel, payload.client, err => {
              if (err) return logger.error(err);
              return logger.info('tuned');
            });
            break;
          case 'key':
            this.remote.processKey(payload.key, payload.client, err => {
              if (err) return logger.error(err);
              return logger.info('keyed');
            });
            break;
          case 'command':
            this.remote.processCommand(payload.command, (err, response) => {
              if (err) return logger.error(err);
              return logger.info('command', response);
            });
            break;
          case 'channel.info':
            this.remote.getProgInfo(payload.channel, payload.start, payload.client, (err, response) => {
              if (err) return logger.error(err);
              return logger.info('channel.info', response);
            });
            break;
          case 'info.current':
            this.remote.getTuned(payload.client, (err, response) => {
              if (err) return logger.error(err);
              return logger.info('info.current', response);
            });
            break;
          // available endpoints
          case 'options':
            this.remote.getOptions((err, response) => {
              if (err) return logger.error(err);
              return logger.info('options', response);
            });
            break;
          case 'locations':
            this.remote.getLocations(payload.type || 1, (err, response) => {
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
            this.remote.getMode(payload.client, (err, response) => {
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
    await this.api.registerDevice();
    await this.saveIp();
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
