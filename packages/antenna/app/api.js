const axios = require('axios');
const logger = require('./logger');

class Api {
  constructor(deviceId) {
    this.deviceId = deviceId;
    this.axios = axios.create({
      baseURL: process.env.API_BASE_URL,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async registerDevice() {
    try {
      logger.info('registerDevice');
      return await this.axios.post(`/device`, { losantId: this.deviceId });
    } catch (error) {
      return console.error(error.response.data);
    }
  }

  async updateDeviceBoxes(boxes) {
    try {
      logger.info('update device boxes', { data });
      return await this.axios.put(`/device/${this.deviceId}`, { boxes });
    } catch (error) {
      return console.error(error);
    }
  }

  async updateDeviceDirectvIp(ip) {
    try {
      logger.info('update device dtv ip');
      const res = await this.axios.post(`/device/${this.deviceId}`, { ip });
      return res.data;
    } catch (error) {
      return console.error(error);
    }
  }
}

module.exports = Api;
