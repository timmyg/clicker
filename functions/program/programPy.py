
import requests
import json
import time
import random
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

headers = {
    'Sec-Fetch-Site': 'same-origin',
    'DNT': '1',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    'Sec-Fetch-Mode': 'cors',
    'Accept': '*/*',
    'Cache-Control': 'no-cache',
    'Referer': 'https://www.directv.com/assets/js/dtve/apps/guide/programDataServiceProcessor.js',
    'Connection': 'keep-alive',
}
dtvApiBaseUrl = 'https://www.directv.com/json'


def getPrograms(event, context):
    print('getPrograms')
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
        randomString = str(random.randint(100000000000, 999999999999))
        print(randomString)
        proxy_raw = 'http://lum-customer-greatviewseats-zone-tim_zone-country-us-session-0.' + \
            randomString + ':1gjgp252qy4b@165.227.199.200:22225'
        proxies = {'http': proxy_raw, 'https': proxy_raw}

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
            print('response code:', response.status_code)
            print('response item length:', len(response.json().get('schedule')))
            print('response:', json.dumps(response.json().get('schedule')))
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(response.json().get('schedule'))
            }
        except:
            time.sleep(1)
            exception = True


def getProgramDetail(event, context):
    print('getProgramDetail')
    data = event['queryStringParameters']
    programmingId = data['programmingId']
    print(programmingId)
    # print(data['zip'])
    # print(data['hours'])
    # print(data['channels'])
    # cookies = {
    #     'dtve-prospect-zip': data['zip']
    # }

    headers = {
        'Sec-Fetch-Site': 'same-origin',
        'DNT': '1',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        'Sec-Fetch-Mode': 'cors',
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.directv.com/assets/js/dtve/apps/guide/programDataServiceProcessor.js',
        'Connection': 'keep-alive',
    }
    exception = True
    while (exception):

        randomString = str(random.randint(100000000000, 999999999999))
        proxy_raw = 'http://lum-customer-greatviewseats-zone-tim_zone-country-us-session-0.' + \
            randomString + ':1gjgp252qy4b@165.227.199.200:22225'
        proxies = {'http': proxy_raw, 'https': proxy_raw}

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
            print('response')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(response.json().get('programDetail'))
            }
        except:
            time.sleep(1)
            exception = True
