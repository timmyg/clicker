async function go() {
  var request = require('request');

  var headers = {
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
    Accept: '*/*',
    Referer: 'https://www.directv.com/assets/js/dtve/apps/guide/programDataServiceProcessor.js',
    Connection: 'keep-alive',
    Cookie:
      '$Cookie: mt.v=2.1466175897.1563574796128; UUID=f6899649-9227-a699-31c3-1d5c3d8c92f1; ATTAUID=f6899649-9227-a699-31c3-1d5c3d8c92f1; _gcl_au=1.1.1823743367.1563574802; _vwo_uuid_v2=D2D7400BE22918AD69B452B1B1E1A2666|b30a65828538f1ebe4a25ff8c52e4dd0; _ga=GA1.2.1318115268.1566430965; _vwo_uuid=D2D7400BE22918AD69B452B1B1E1A2666; s_ecid=MCMID%7C37497605615920232153808414103863898501; AAMC_directv_0=REGION%7C7; QuantumMetricUserID=0af63c54d0479b8801ca55a32e157214; dtvzip=45212; s_channel=%5B%5B%27Typed%2FBookmarked%27%2C%271571880628756%27%5D%5D; customer=yes; rxVisitor=1574734794183ADK8ETJHB0HO5Q1THTARU6A2845KH03A; _fbp=fb.1.1574734798308.810801891; dtvpepod=OLD; DYN_USER_ID=344823247_TMBR; DYN_USER_CONFIRM=e5769f3d258bdea357e115a6c3b80fa4; dtv-msg-key-cache=f2f4b6987855de75fb25f643800680fe9e3b7e71; AB_IDPROOT=new_idproot_20190410; dtve-tour-browse=false; AMCV_8EAC67C25245B1820A490D4C%40AdobeOrg=1994364360%7CMCMID%7C37497605615920232153808414103863898501%7CMCAAMLH-1577454768%7C7%7CMCAAMB-1577454768%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1576857158s%7CNONE%7CvVersion%7C3.4.0%7CMCIDTS%7C18251%7CMCAID%7CNONE%7CMCCIDH%7C2121515433; mboxEdgeCluster=17; attPersistantLocalization=ltype=res|segment=res|company=att|state=Ohio|city=Cincinnati|dma=515|zipCode=45212; s_dfa=attglobalprod%2Cattconprod; s_visit=1; gpv_v100=DTVE%3AGuide%3AIndex; s_lv_s=Less%20than%201%20day; s_vnum30=1579440650152%26vn%3D2; s_invisit30=true; s_vnum90=1580174259121%26vn%3D10; s_invisit90=true; aam_uuid=45616968870523217684583960769155123906; DCPROSPECT=PHX; JSESSIONID=XQntd9ypnlQm9g2TDyBGWnj49JNkDwjWng6PnQvc6z21yF0cLpqM\u0021624051794; IDPROOT-TEST=AB-IDPROOT-New; ak_bmsc=ABC84ED59053AA6652AD474366E1E8DCB81C11402E1E0000FC1EFD5D00C92952~plSqq6L64X5rGNhA171+TDSwyoW4QRLNJ2+WYlpnfOqIFipZLKsJZqTWABGlg1gsePHKc59XZoeaR8hxC1wKtpSSKzN8/TaerY5oT4Ywlbcd4BHsJBrXwpiCd0Da36JHdIlC0muSrahzCewcmH3HX1kCfEfNS4MFBeeqyWP1afBhhidsgRAbP/MS6TNsfEZRdv2l7/mhlGrcqNNpmMj/1jHqQ5LCm6tllaR09G/cWTDH2hLj4i7UHVeQqUzcU3ZnEXJIjR2WdVe+9RKVycPaJKAw==; intent=all; dtv-lsid=ck4ekzqbv18o5mdqu94pdxd6r; s_cc=true; QuantumMetricSessionID=e34f5669d36af29741fd3d37ad0a7844; AMCVS_55633F7A534535110A490D44%40AdobeOrg=1; AMCV_55633F7A534535110A490D44%40AdobeOrg=1994364360%7CMCIDTS%7C18251%7CMCMID%7C45520962155196799464611593993742998752%7CMCAAMLH-1577477001%7C7%7CMCAAMB-1577477001%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1576879401s%7CNONE%7CMCAID%7CNONE%7CMCCIDH%7C-1045351470%7CvVersion%7C3.4.0; s_tps=NaN; TLTSID=CADC9B0E236310230006D2590968E2BA; TLTUID=CADC9B0E236310230006D2590968E2BA; mbox=PC#4df2c363b0054301b806ffeb290000ab.17_106#1640117013|session#271a1451a9e64536a31f4f35af493c80#1576874074; bm_sv=F713232B15BB9F74A8E86282FB13ED65~w1WFe6adNPELdAHeXPMO6R+1h/5pK5UMEPFcV/LflL15brKDbjUC7VoooW65iFvx/TDFkvc0fCqyLMxTqX+IFkBaQGXuXjOrAm/goJvf5RmqM9fFdIFMxMdsKhY5Q4r+e3MF2lz6bv3ofhqY+n9asrXTPup84L6YzJ86AzqcET8=; s_lv=1576872217729; s_ppvl=DTVE%253AGuide%253AIndex%2C0%2C0%2C0%2C1422%2C150%2C1920%2C1080%2C1%2CL; pses={"id":"uqyf1ngwkb","start":1576869636878,"last":1576872219685}; fsr.s={"v2":-2,"v1":1,"rid":"de358f8-93203597-5eaf-0a19-953f7","to":4.4,"c":"https://www.directv.com/guide","pv":2,"f":1576872211520}; RT=z=1&dm=www.directv.com&si=665fda42-1ead-40e3-afab-bf8731b33f82&ss=k4ejglty&sl=5&tt=awd&bcn=%2F%2F173e2516.akstat.io%2F; s_ppv=DTVE%253AGuide%253AIndex%2C0%2C0%2C0%2C1422%2C296%2C1920%2C1080%2C1%2CL; s_pvs=370',
  };

  var options = {
    url:
      'https://www.directv.com/json/channelschedule?channels=1,2,5,5,9,9,12,12,14,14,19,19,25,48,48,54,54,64,64,70,70,70,70,71&startTime=Fri%20Dec%2020%202019%2016:00:00%20GMT-0500%20(Eastern%20Standard%20Time)&hours=8&chIds=238,6323,8783,875,8784,876,8785,877,3828,2186,8786,878,1042,3033,1043,8319,1044,1895,1045,4063,6111,3849,4062,1016',
    headers: headers,
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  }

  request(options, callback);
}

go();
