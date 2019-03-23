require('dotenv').config();
const logger = require('./app/logger');
const Widget = require('./app/widget');

logger.info('starting up');

(() =>
  new Widget(
    process.env.LOSANT_KEY,
    process.env.LOSANT_SECRET,
    process.env.LOSANT_DEVICE_ID,
    process.env.LOCATION_ID,
  ))();
