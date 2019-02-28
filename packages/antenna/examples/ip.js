const arpScanner = require('arpscan');

arpScanner(onResult);

function onResult(err, data) {
  if (err) throw err;
  //   console.log(data);
  //   data.forEach(device => {
  //     console.log(device.ip);
  //   });
  console.log(data.map(device => device.ip));
}
