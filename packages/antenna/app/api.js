const axios = require('axios');
const logger = require('./logger');

class Api {
  constructor(locationId) {
    this.locationId = locationId;
    this.axios = axios.create({
      baseURL: process.env.API_BASE_URL,
      timeout: 6000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // async register() {
  //   try {
  //     logger.info('registerDevice');
  //     return await this.axios.post(`/device`, { losantId: this.locationId });
  //   } catch (error) {
  //     return console.error(error.response.data);
  //   }
  // }

  async setBoxes(boxes) {
    try {
      logger.info('update device boxes', { boxes });
      logger.info(`/locations/${this.locationId}/boxes`);
      logger.info(`here's the boxes`);
      logger.info(boxes);
      logger.info(`/locations/${this.locationId}/boxes`);

      return await this.axios.put(`/locations/${this.locationId}/boxes`, boxes);
    } catch (error) {
      return console.error(error);
    }
  }

  async updateIp(ip) {
    try {
      // logger.info('update device dtv ip', ip);
      // console.log(`/locations/${this.locationId}`, { ip }, process.env.API_BASE_URL);
      // console.log(this.axios);
      const res = await this.axios.put(`/locations/${this.locationId}`, { ip });
      return res.data;
    } catch (error) {
      return console.error(error);
    }
  }
}

module.exports = Api;
