console.log(4);
(async () => {
  const axios = require('axios');
  try {
    console.log('hi');
    const result = await axios.get('https://httpstat.us/404?sleep=1000');
  } catch (e) {
    // console.error(e);
    console.error(e.response.status === 405);
  }
})();
