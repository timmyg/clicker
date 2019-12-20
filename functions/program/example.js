(async () => {
  // const axios = require('axios');
  // try {
  //   console.log('hi');
  //   const result = await axios.get('https://httpstat.us/404?sleep=1000');
  // } catch (e) {
  //   // console.error(e);
  //   console.error(e.response.status === 405);
  // }
  const fetch = require('node-fetch');
  const url = 'https://jsonplaceholder.typicode.com/users';
  const params = new URLSearchParams({
    channels: '5,9,12,19,206,207,208,209,212,213,215,217,219,220,245,245,245,247,247,247,610,611,612,661',
    startTime: 'Fri%20Dec%2020%202019%2000:00:00%20GMT-0500%20(Eastern%20Standard%20Time)',
    hours: 8,
  });
  const x = await fetch(url + params, {
    method: 'get',
    // body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(x.json());
})();
