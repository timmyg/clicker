import axios from 'axios';

class Api {
  constructor() {
    this.axios = axios.create({ baseURL: process.env.API_BASE_URL, timeout: 3000 });
  }

  static async updateDevice(deviceId, data) {
    try {
      return await this.axios.put(`/device/${deviceId}`, data);
    } catch (error) {
      return console.error(error);
    }
  }

  static async getDeviceDirectvIp(deviceId) {
    try {
      return await this.axios.get(`/device/${deviceId}/ip`);
    } catch (error) {
      return console.error(error);
    }
  }
}

export default Api;
