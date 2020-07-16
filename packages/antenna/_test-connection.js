const { Device } = require("losant-mqtt");
require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: "./.env" });
const util = require("util");

console.log(
  "attempting to connect to device",
  process.env.LOSANT_DEVICE_ID,
  process.env.LOSANT_KEY,
  process.env.LOSANT_SECRET,
  "..."
);
const device = new Device({
  id: process.env.LOSANT_DEVICE_ID,
  key: process.env.LOSANT_KEY,
  secret: process.env.LOSANT_SECRET,
  //   transport: "ws",
});
console.log(util.inspect(device));
device.on("error", (err) => {
  console.log("errr!");
  console.log(err);
});
device.connect((error) => {
  console.log("returned");
  if (error) {
    console.log("has errrrr:");
    console.error(error);
    return;
  }
  console.log(`successfully connected!`);
});

const intervalId = setInterval(() => {
  console.log(device.isConnected() ? "connected!" : ".");
  if (device.isConnected()) {
    clearInterval(intervalId);
  }
}, 1000);
