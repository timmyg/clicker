// to run:
//  npm install axios
//  node example.js

async function go() {
  const axios = require('axios');

  const url = `https://www.directv.com/json/channelschedule`;
  const channelsString = [9, 206].join(',');
  const params = { startTime: 'Fri Dec 20 2019 10:00:00 GMT+0000', hours: 8, channels: channelsString };
  const headers = {
    // Cookie: `dtve-prospect-zip=45212; TLTSID=07AB36D2984D10980006B9E2CD812DCD; TLTUID=07AB36D2984D10980006B9E2CD812DCD; dtv-lsid=cjxaz2wvrtrfzlhqxez7ebw3k; customer=yes; dtv-msg-key-cache=f2f4b6987855de75fb25f643800680fe9e3b7e71; AB_IDPROOT=new_idproot_20190410; ak_bmsc=BF3F5616F70B1D3EBCBB8528B9CF0AC5B81B2D9AA23E0000DA20FD5DF346D533~plhd0d9XqziHqQPQJ6Ono9r+jJYoytwdXPspAQvp216SDIBxPPpDVoOZVge2RFIS6JGjilwgnRukLLcw64Wasa3T3osFoGU1wcSl17r1ApQ2vJvahtErciLCUS0kA3Y8fC7CgGHaFMfTr5kvWaHUea3s6xCQti+OQtD6mWyOroIaYJi/CRqhWHeCIvLhtnYFQstHDAW2XMgvW6Dlnq09TMcd1N1tMk+dZSe60dGkoA9fg=`,
  };
  const method = 'get';
  // const timeout = 2000;
  console.log('getting channels....', params, headers);
  console.log('calling...');
  const result = await axios({
    method,
    url,
    params,
    headers,
  });
  console.log('back!', result);
}

go();
