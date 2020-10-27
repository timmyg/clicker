const DirecTV = require("directv-remote-minor");
const ips = ["192.168.86.34"];
const client = null;

ips.forEach(ip => {
  const remote = new DirecTV.Remote(ip);
  remote.getTuned(client || "0", (err, response) => {
    if (err) {
      console.log(`bad: *${ip}*`)
    } else {
      const {callsign, major, title} = response;
      console.log(`good: ${ip} - ${callsign} - ${major} - ${title}`)
    }
  })
})
