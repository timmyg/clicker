const axios = require('axios');

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
      return await this.axios.post(`/device`, { losantId, location: '' });
    } catch (error) {
      return console.error(error.response.data);
    }
  }

  async updateDevice(deviceId, data) {
    try {
      return await this.axios.put(`/device/${deviceId}`, data);
    } catch (error) {
      return console.error(error);
    }
  }

  async getDeviceDirectvIp(deviceId) {
    try {
      return await this.axios.get(`/device/${deviceId}/ip/example`);
    } catch (error) {
      // return console.error(error);
    }
  }
}

module.exports = Api;
