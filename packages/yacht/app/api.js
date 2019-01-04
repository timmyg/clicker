const axios = require('axios');
const logger = require('./logger');

class Api {
  constructor() {
    this.axios = axios.create({
      baseURL: process.env.API_BASE_URL,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async registerDevice(losantId) {
    try {
      logger.info('registerDevice');
      return await this.axios.post(`/device`, { losantId, location: '' });
    } catch (error) {
      return console.error(error.response.data);
    }
  }

  async updateDevice(deviceId, data) {
    try {
      logger.info('updateDevice', { data });
      return await this.axios.put(`/device/${deviceId}`, data);
    } catch (error) {
      return console.error(error);
    }
  }

  async getDeviceDirectvIp(deviceId) {
    try {
      logger.info('getDeviceDirectvIp');
      const res = await this.axios.get(`/device/${deviceId}/ip`);
      return res.data;
    } catch (error) {
      return console.error(error);
    }
  }
}

module.exports = Api;
