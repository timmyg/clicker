const DirecTV = require('directv-remote');
const async = require('async');
const { Device } = require('losant-mqtt');
const logger = require('./logger');
const Api = require('./api');
const browser = require('iotdb-arp');

class Widget {
  constructor(losantKey, losantSecret, losantDeviceId, locationId) {
    this.device = new Device({
      id: losantDeviceId,
      key: losantKey,
      secret: losantSecret,
    });
    this.locationId = locationId;
    this.remote = null;
    this.api = new Api(this.locationId);
    this.init();
  }

  async syncIpsAndBoxes() {
    const context = this;
    logger.info('about to search ips....');
    browser.browser({}, (error, device) => {
      if (device) {
        logger.info({ device });
        let { ip } = device;
        if (
          !/^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/.test(
            ip,
          )
        ) {
          logger.info(`.......... invalid ip: ${ip}`);
          return;
        }
        DirecTV.validateIP(ip, error => {
          if (error) {
            logger.info(`.......... not valid directv ip: ${ip}`);
            return;
          }
          logger.info(`*#$&%~%*$& valid directv ip: ${ip}`);
          return context.saveBoxes(ip);
          // return context.api.updateIp(ip);
        });
      } else if (error) {
        logger.error(error);
      } else {
        logger.error('no ips found...');
      }
    });
  }

  async saveBoxes(ip) {
    logger.info(`*#$&%~%*$& save boxes: ${ip}`);
    const remote = new DirecTV.Remote(ip);
    remote.getLocations(undefined, (err, response) => {
      if (err) {
        return logger.error(err);
      }
      logger.info({ boxes: response, ip });
      return this.api.setBoxes(ip, response.locations);
    });
  }

  async initListeners() {
    try {
      const context = this;
      // Listen for commands from Losant
      this.device.on('command', async command => {
        console.log({ command });
        logger.info({ command });
        const { name, payload } = command;
        const { ip } = payload;
        if (ip) this.remote = new DirecTV.Remote(ip);
        switch (name) {
          case 'tune':
            this.remote.tune(payload.channel, payload.channelMinor, payload.client, err => {
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
            this.remote.getProgInfo(
              payload.channel,
              payload.channelMinor,
              payload.start,
              payload.client,
              (err, response) => {
                if (err) return logger.error(err);
                return logger.info('channel.info', response);
              },
            );
            break;
          case 'info.current':
            this.remote.getTuned(payload.client || '0', (err, response) => {
              if (err) return logger.error(JSON.stringify(err));
              logger.info('info.current!!');
              logger.info(JSON.stringify(response), payload);
              context.api.saveBoxInfo(payload.boxId, response);
              return;
            });
            break;
          case 'info.current.all':
            // logger.info('info.current.all!!', payload);
            const { boxes } = payload;
            logger.info('info.current.all!!', 'boxes', boxes.length);
            const boxesInfo = [];
            async.eachSeries(
              boxes,
              function(box, callback) {
                const { boxId, client, ip } = box;
                const _remote = new DirecTV.Remote(ip);
                logger.info('getTuned', { boxId, client, ip });
                _remote.getTuned(client || '0', (err, response) => {
                  if (err) {
                    logger.error('getTuned error!!', err);
                    if (err && err.message && err.message.includes('getaddrinfo ENOTFOUND')) {
                      logger.error('BAD IP ADDRESS');
                    } else if (err && err.message && err.message.includes('Forbidden.Command not allowed.')) {
                      logger.error('NEED TO ENABLE CURRENT PROGRAM ACCESS');
                    }
                  } else {
                    boxesInfo.push({ boxId, info: response });
                  }
                  return callback();
                });
              },
              function(err) {
                if (boxesInfo && boxesInfo.length) {
                  logger.info('saveBoxesInfo!!', boxesInfo);
                  context.api.saveBoxesInfo(boxesInfo);
                } else {
                  logger.error('no boxes');
                }
              },
            );

            break;
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
          case 'sync.boxes':
            await this.syncIpsAndBoxes();
            return logger.info('sync.boxes');
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
    // await this.api.register();
    await this.syncIpsAndBoxes();
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
