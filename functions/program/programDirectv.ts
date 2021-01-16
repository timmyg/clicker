import { getBody, getPathParameters, respond, Raven, RavenLambdaWrapper, Invoke } from 'serverless-helpers';
require('cross-fetch/polyfill');
const directvEndpoint = 'https://www.directv.com/json';
import request from 'request-promise';
const BrowserHeadersGenerator = require('browser-headers-generator');

const userAgentList = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
  // 'Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66',
  // 'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
  // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0',
  // 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:84.0) Gecko/20100101 Firefox/84.0',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
  // 'Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.60',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.16; rv:84.0) Gecko/20100101 Firefox/84.0',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
  // 'Mozilla/5.0 (X11; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0',
  // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:83.0) Gecko/20100101 Firefox/83.0',
  // 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 OPR/73.0.3856.284',
  // 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:84.0) Gecko/20100101 Firefox/84.0',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.60 YaBrowser/20.12.0.963 Yowser/2.5 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
  // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36',
  // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
  // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
  // 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 OPR/73.0.3856.329',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15',
  // 'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
  // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0',
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:84.0) Gecko/20100101 Firefox/84.0',
  // 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
  // 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0',
];

function getUserAgent(i?) {
  const index = i === undefined ? Math.floor(Math.random() * userAgentList.length) : i;
  return userAgentList[index];
}

async function getRandomizedBrowserHeaders() {
  const browserHeadersGenerator = new BrowserHeadersGenerator();
  await browserHeadersGenerator.initialize();
  const headers = await browserHeadersGenerator.getRandomizedHeaders();
  console.log({ headers });
  return headers;
}

async function call({ path, queryParams, headers }, agentIndex?, retryFailures = true, proxy = true) {
  const userAgent = getUserAgent(agentIndex);
  let options = {};
  try {
    options = {
      url: directvEndpoint + path,
      method: 'GET',
      qs: queryParams,
      proxy: proxy ? 'http://lum-customer-clicker-zone-static:959l49mpzwwb@zproxy.lum-superproxy.io:22225' : null,
      timeout: 1000,
      gzip: true,

      headers: {
        // ...headers,
        // ...getRandomizedBrowserHeaders(),
        // authority: 'www.directv.com',
        // 'upgrade-insecure-requests': '1',
        // 'user-agent':
        //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        // accept:
        //   'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        // 'sec-fetch-site': 'none',
        // 'sec-fetch-mode': 'navigate',
        // 'sec-fetch-user': '?1',
        // 'sec-fetch-dest': 'document',
        // 'accept-language': 'en-US,en;q=0.9',
        // 'Sec-Fetch-Site': 'same-origin',
        // DNT: '1',
        // 'Accept-Encoding': 'gzip, deflate, br',
        // 'Accept-Language': 'en-US,en;q=0.9',
        // 'User-Agent': userAgent,
        // 'Sec-Fetch-Mode': 'cors',
        // // Accept: '*/*',
        // 'Cache-Control': 'no-cache',
        // Referer: 'https://www.directv.com/assets/js/dtve/apps/guide/programDataServiceProcessor.js',
        // Connection: 'keep-alive',
        // 'Content-Type': 'application/json; charset=utf-8',
        // accept:
        //   'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        authority: 'www.directv.com',
        pragma: 'no-cache',
        'cache-control': 'no-cache',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-language': 'en-US,en;q=0.9',
        cookie:
          'dtv-lsid=ckjzunuv20pf3k8qkat4c1tau; dtv-msg-key-cache=7703adb4dc6194280cc85c8ffc27e8f4c85a429d; AB_IDPROOT=new_idproot_20190410; IDPROOT-TEST=AB-IDPROOT-New; ak_bmsc=667223320F7FA1A04B05B0CB37A292631738A8B77F2F00006C020360EFDAD70E~plE006pZQI0Le4tS3XAN0ooLqNmFBZ/zJmiJ1FY5l6hoDG0efc8qcTqfQNLDvjCZ4rz8LLXkPE11dSusvgdoXPFSaMWePn3QvxxRrDmvtOfbhxf9qGw7rLnVqCI+ghAALQvOYO1iqnt5vVi1C6/siA9YJNc5+jMuf7eweMeDXaCJRDbtwYh1aUg02pKVHVBbpoyJT0P0Q0jKDol+dCHq7WyI9nQ4fmSp77XCJE9gM4E88=; DCPROSPECT=PHX; bm_sv=A72366896CCC2768912FE5B208A0AAEA~zAuXvvGsaM31nzmvkV6WWrCoXpEPeXZZv1TJk0Q7/r9KV4eGEmXTgRsz6paRkMqbL0LsL8SbXWF3sYztp2+qD2TaqIaWzc5JBUBQDbvamJGkcNU92vWetsL3aNRDvrduNEdWH/lGbYaKnkdasZ3C9uIQLQZXQOk9EurEujFShso=',
      },
    };
    const response = await request(options);
    // console.log('success');
    return {
      data: JSON.parse(response),
      requestUserAgent: options['headers']['User-Agent'],
      proxy: options['proxy'],
    };
  } catch (e) {
    if (retryFailures) {
      console.log('failed, retrying...');
      return call(buildRequest(path, queryParams, headers));
    } else {
      return {
        requestUserAgent: options['headers']['User-Agent'],
        proxy: options['proxy'],
      };
    }
  }
}

function buildRequest(path, queryParams?, headers?) {
  return {
    path,
    queryParams,
    headers,
  };
}

export const evaluateUserAgents = RavenLambdaWrapper.handler(Raven, async event => {
  console.log('evaluateUserAgents');
  const { programmingId, proxy } = event.queryStringParameters;
  const path = '/program/flip/' + programmingId;
  let i = 0;
  const results = {
    good: [],
    failed: [],
  };
  while (i <= userAgentList.length - 1) {
    const response = await call(buildRequest(path), i, false, proxy);
    const proxyString = `${response.proxy ? 'with proxy' : 'without proxy'}`;
    const userAgentString = response.requestUserAgent;
    if (response.data) {
      console.error('   ok with', userAgentString, proxyString);
      results.good.push(userAgentString);
    } else {
      console.error('error with', userAgentString, proxyString);
      results.failed.push(userAgentString);
    }
    i++;
  }
  return respond(200, {
    goodPercentage: `${Math.floor(results.good.length / i) * 100}%`,
    totalEvaluated: i,
    goodCount: results.good.length,
    failedCount: results.failed.length,
    good: results.good,
  });
});

export const getProgramDetail = RavenLambdaWrapper.handler(Raven, async event => {
  const { programmingId } = event.queryStringParameters;
  const path = '/program/flip/' + programmingId;
  const response = await call(buildRequest(path));
  return respond(200, response.data);
});

export const getSchedule = RavenLambdaWrapper.handler(Raven, async event => {
  const { start, zip, hours, channels } = event.queryStringParameters;
  const queryParams = {
    start,
    hours,
    channels,
  };
  const headers = {
    Cookie: `dtve-prospect-zip=${zip}`,
  };
  const path = '/channelschedule';
  const response = await call(buildRequest(path, queryParams, headers));
  return respond(200, response.data);
});
