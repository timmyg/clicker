
import requests
import json


def getPrograms(event, context):
    print('getPrograms')
    # data = json.loads(event['body'])
    # print(data)
    # print(data['start'])
    # print(data['zip'])
    cookies = {
        'dtve-prospect-zip': '45212'
        # '$Cookie: dtv-lsid': 'ck4f01qyh1zn7m3qu9sn628ec',
        # 'AB_IDPROOT': 'new_idproot_20190410',
        # 'IDPROOT-TEST': 'AB-IDPROOT-New',
        # 'UUID': '5dfd8bd5-1438-a633-854b-c8477f843860',
        # 'rxVisitor': '1576897475990ORK2US8GRKP81OKFMC41621K540PVH2T',
        # 'AMCVS_55633F7A534535110A490D44%40AdobeOrg': '1',
        # 'ATTAUID': '5dfd8bd5-1438-a633-854b-c8477f843860',
        # 's_cc': 'true',
        # 'QuantumMetricUserID': '49d85a74f6f9dd4e137311f252a750f2',
        # 'QuantumMetricSessionID': '9e2a0ba08365e9a106f7f72f38fd0fc1',
        # '_gcl_au': '1.1.1249825109.1576897483',
        # '_fbp': 'fb.1.1576897486033.1544979860',
        # 'dtve-tour-browse': 'false',
        # 'TLTSID': 'B2816F86239E10230038CE6473CC8A83',
        # 'TLTUID': 'B2816F86239E10230038CE6473CC8A83',
        # 'intent': 'all',
        # 'AMCVS_8EAC67C25245B1820A490D4C%40AdobeOrg': '1',
        # 'dtv-msg-key-cache': 'f2f4b6987855de75fb25f643800680fe9e3b7e71',
        # 'mt.v': '2.402774444.1576897492543',
        # 'AAMC_directv_0': 'REGION%7C7',
        # 'AMCV_8EAC67C25245B1820A490D4C%40AdobeOrg': '1994364360%7CMCMID%7C70822043302633301062398230058950590288%7CMCAAMLH-1577502297%7C7%7CMCAAMB-1577502297%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1576904692s%7CNONE%7CvVersion%7C3.4.0%7CMCCIDH%7C2121515433%7CMCSYNCSOP%7C411-18259',
        # 's_tps': 'NaN',
        # 's_ppvl': '%5B%5BB%5D%5D',
        # 's_ppv': 'DTVE%253AGuide%253AIndex%2C1%2C1%2C757%2C1600%2C757%2C1600%2C900%2C1%2CL',
        # 'dtLatC': '76',
        # 's_dfa': 'attglobalprod%2Cattconprod',
        # 'mboxEdgeCluster': '17',
        # 'idpmgw': 'eyJjcyI6IlVuQXV0aCIsInNpZCI6IkVINE5aeHMycnlDblhlamFkV25FNFJ5RzJQbVpEZnd2QU9rd2dFME0waG8iLCJjc1RrIjoiaFBQc21Pa0w5dG5UTms5Ri9NOG05VXI3Q0hUaThSWlM0UFdwND0iLCJpYXQiOjE1NzY5MDk3MDIsImV4cCI6MTU3NjkxMTUwMn0.RyzF7D3cOVogH1nDVR7oy86OCMi_sSs4eT8rf2bJ0WQ',
        # 'AMCV_55633F7A534535110A490D44%40AdobeOrg': '1994364360%7CMCIDTS%7C18252%7CMCMID%7C10757995585616187722826732934422746566%7CMCAAMLH-1577514483%7C7%7CMCAAMB-1577514483%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1576916883s%7CNONE%7CMCAID%7CNONE%7CMCCIDH%7C-753316189%7CvVersion%7C3.4.0',
        # 'ak_bmsc': 'E034A67CE8FE7023960788FF867E639517C91FA47C02000083BBFD5DACF60365~plp7bPdJssI9BVqaJA60BCb55gkzrZDoEussI69ePub60fExGXflD09rTZgVd+GyUN0Rs5A7jd1wUmwAZfDoCWZIfLw/kpgcXgjr7y4glivd57xIZf8N5aJ01YkbW/jyAn19BwJcfEP1WkooyYq2yOV8f1VDQd97Pnw9qqOrc/Nn5eK8w1FHFEUzPz6y8MUdS2l2tOBzIokZoEWFsjgslKMtFQipu/m09zMM47M401MGKAIfGDpOeOQDoVBhK/jHk5',
        # 's_sq': '%5B%5BB%5D%5D',
        # 'dtSa': 'false%7CC%7C25%7CGuide%7Cx%7C1576909690392%7C109680971_20%7Chttps%3A%2F%2Fwww.directv.com%2F%7CDIRECTV%20Official%20Site%20%5Ep%20Call%20to%20Order%201-800-490-4388%7C1576897484830%7C%7C',
        # 'dtCookie': '1$22CE88C704F401A3DD91F6731546ED06|cf470c9bb47b0e2f|1',
        # 'DCPROSPECT': 'DEN',
        # 'rxvt': '1576911491539|1576909680982',
        # 'dtPC': '1$109680971_20h-vDHMLBISBIEXMAAMEKVJIIOHKJFFDKKJG',
        # 's_visit': '1',
        # 'gpv_v100': 'DTVE%3AGuide%3AIndex',
        # 's_lv_s': 'Less%20than%201%20day',
        # 's_lv': '1576909697237',
        # 's_vnum30': '1579489497101%26vn%3D2',
        # 's_invisit30': 'true',
        # 's_vnum90': '1584673497103%26vn%3D2',
        # 's_invisit90': 'true',
        # 'aam_uuid': '75701982191482487013030797149175383063',
        # 'pses': '{"id":"e5v2pwpuq5u","start":1576909684251,"last":1576909699010}',
        # 's_pvs': '198',
        # 'JSESSIONID': '9R58d97QBB0vbJJtmmFLYts9FTYMDJJpW61TpllyTsKRCTqy7dHp\\u0021-2006313742',
        # 'fsr.s': '{"v2":-2,"v1":1,"rid":"d489c28-86484024-eb78-96c3-327ec","to":5,"c":"https://www.directv.com/guide","pv":5,"f":1576909710111}',
        # 'mbox': """PC#6bf49588148945f2bfbb988ce34caf29.17_70#1640154512|session#2d2e947bf3df489a8a6b4c076b0e648f#1576911572""",
        # 'check': 'true',
        # 'bm_sv': 'D0E115A7CD906DC01E973C23DF0B1264~AmKhgOPaazPteLtivXfL+jIdJMXf9aI/ADXIy0eJGqaZukLu98QWlrs2zHSxjx00FOQaySAelCh5nPFt3T549WYn43IErh3FUnbr/wrFmBT5V1jcMS+Dml/wVn9xnG5L+xbmnezHq8SCDZvvWK28BsRZ60sYaJrAxgmL6EDC1Zk=',
        # 'RT': 'z=1&dm=www.directv.com&si=30d614fe-0157-470d-8694-d9eee0bbb788&ss=k4f7badp&sl=2&tt=gq&bcn=%2F%2F17d09915.akstat.io%2F',
    }

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

    params = (
        ('channels', '1,6,15,17,22,47,53,65,70,70,70,70,71,71,72,73,74,75,76,77,78,79,80,81'),
        ('startTime', 'Mon Dec 23 2019 00:00:00 GMT-0500 (Eastern Standard Time)'),
        ('hours', '8'),
        ('chIds', '238,2071,2073,2076,6069,6092,2075,4317,4063,6111,3849,4062,1016,1904,1977,6209,1978,354,4328,553,219,5239,348,332'),
    )

    proxy_raw = 'http://lum-customer-greatviewseats-zone-tim_zone-country-us-session-0.639950638483:1gjgp252qy4b@165.227.199.200:22225'
    proxies = {'http': proxy_raw, 'https': proxy_raw}

    print('calling...')
    response = requests.get('https://www.directv.com/json/channelschedule',
                            headers=headers,
                            params=params,
                            cookies=cookies,
                            proxies=proxies
                            )
    print('response')
    # print(response.json())
    # response.json()
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': dict(response.json())
    }
