
import requests
import json
import time
import random
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

dtvApiBaseUrl = 'https://www.directv.com/json'


def health():
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'message': 'ok'})
    }

def getHeaders():
    # user_agent_list = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
    #                    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:78.0) Gecko/20100101 Firefox/78.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36']
    # user_agent_list = [
    #     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15',
    #     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
    # ]
    user_agent_list = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
    ]
    randomUserAgent = random.choice(user_agent_list)
    print(randomUserAgent)
    return {
        'Sec-Fetch-Site': 'same-origin',
        'DNT': '1',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': randomUserAgent,
        'Sec-Fetch-Mode': 'cors',
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.directv.com/assets/js/dtve/apps/guide/programDataServiceProcessor.js',
        'Connection': 'keep-alive',
    }


def getSchedule(event, context):
    print('getSchedule')
    data = event['queryStringParameters']
    print(data['start'])
    print(data['zip'])
    print(data['hours'])
    print(data['channels'])
    cookies = {
        'dtve-prospect-zip': data['zip']
    }

    params = (
        ('channels',  data['channels']),
        # 'Mon Dec 23 2019 00:00:00 GMT-0500 (Eastern Standard Time)'),
        ('startTime', data['start']),
        ('hours', data['hours']),
        # ('chIds', '238,2071,2073,2076,6069,6092,2075,4317,4063,6111,3849,4062,1016,1904,1977,6209,1978,354,4328,553,219,5239,348,332'),
    )

    exception = True
    while (exception):
        proxy_raw = 'http://lum-customer-clicker-zone-static:959l49mpzwwb@zproxy.lum-superproxy.io:22225'
        proxies = {'http': proxy_raw, 'https': proxy_raw}
        headers = getHeaders()

        print('calling...')

        s = requests.Session()
        retries = Retry(total=5, backoff_factor=1,
                        status_forcelist=[502, 503, 504])
        s.mount('http://', HTTPAdapter(max_retries=retries))

        try:
            response = s.get(dtvApiBaseUrl + '/channelschedule',
                             headers=headers,
                             params=params,
                             cookies=cookies,
                             proxies=proxies,
                             timeout=3
                             )
            # print('response code :', response.status_code)

            # print('response item length:', len(
            #     response.json().get('schedule')))
            # print('response:', json.dumps(response.json()))
            exception = False
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(response.json().get('schedule'))
            }
        except:
            print('failed', json.dumps(headers))
            time.sleep(.2)
            exception = True


def getProgramDetail(event, context):
    print('getProgramDetail')
    data = event['queryStringParameters']
    programmingId = data['programmingId']
    print(programmingId)
    exception = True
    while (exception):
        randomString = str(random.randint(100000000000, 999999999999))
        proxy_raw = 'http://lum-customer-clicker-zone-static:959l49mpzwwb@zproxy.lum-superproxy.io:22225'
        proxies = {'http': proxy_raw, 'https': proxy_raw}
        headers = getHeaders()

        print('calling...')
        s = requests.Session()
        retries = Retry(total=5, backoff_factor=1,
                        status_forcelist=[502, 503, 504])
        s.mount('http://', HTTPAdapter(max_retries=retries))
        try:
            response = s.get(dtvApiBaseUrl + '/program/flip/' + programmingId,
                             headers=headers,
                             # cookies=cookies,
                             proxies=proxies,
                             timeout=3
                             )
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(response.json().get('programDetail'))
            }
        except:
            print('failed', json.dumps(headers))
            time.sleep(1)
            exception = True