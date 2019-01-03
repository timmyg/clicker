require('dotenv').config();
const Device = require('./device');

const device = new Device(process.env.LOSANT_DEVICE_ID, process.env.LOSANT_KEY, process.env.LOSANT_SECRET);

connect();
