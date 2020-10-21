const DirecTV = require("directv-remote-minor");
const ips = ["10.34.0.84","10.34.0.85","10.34.0.86","10.34.0.87",
  "10.34.0.88","10.34.0.89","10.34.0.90"];
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
