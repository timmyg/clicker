require('dotenv').config();
const Widget = require('./widget');

(() => new Widget(process.env.LOSANT_DEVICE_ID, process.env.LOSANT_KEY, process.env.LOSANT_SECRET))();
