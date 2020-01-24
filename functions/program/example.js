// to run:
//  npm install axios
//  node example.js

async function go() {
  const axios = require("axios");
  const http = require("http");
  const https = require("https");

  const url = `https://www.directv.com/json/channelschedule`;
  const channelsString = [9, 206].join(",");
  const params = {
    startTime: "Fri Dec 20 2019 10:00:00 GMT+0000",
    hours: 8,
    channels: channelsString
  };
  const headers = {
    Cookie: `mt.v=2.1662130847.1576874514918; UUID=77597795-6948-a303-c493-ede4e9042dce; ATTAUID=77597795-6948-a303-c493-ede4e9042dce; QuantumMetricUserID=07b92c79f5559fa483f0d39f1bd0d495; AMCV_8EAC67C25245B1820A490D4C%40AdobeOrg=1994364360%7CMCMID%7C48303297626331669480608979260429482186%7CMCAAMLH-1577479324%7C7%7CMCAAMB-1577479324%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1576881716s%7CNONE%7CMCCIDH%7C2121515433%7CvVersion%7C3.4.0; _gcl_au=1.1.1924333660.1576874527; dtv-lsid=ck4fpznnu0nra9bqup8kt16oj; IDPROOT-TEST=AB-IDPROOT-New; intent=all; s_cc=true; AMCVS_55633F7A534535110A490D44%40AdobeOrg=1; aam_uuid=52105099136547745630230865635097101197; s_tps=NaN; s_sq=%5B%5BB%5D%5D; dtve-prospect-zip=45212%7CAmerica%2FNew_York; dtve-prospect-state=OH; TLTSID=2F327768240410240001EABCBAE2906B; TLTUID=2F327768240410240001EABCBAE2906B; DCPROSPECT=PHX; s_ppvl=DTVE%253AGuide%253AIndex%2C0%2C0%2C0%2C1387%2C228%2C1440%2C900%2C2%2CL; s_ppv=DTVE%253AGuide%253AIndex%2C0%2C0%2C0%2C1387%2C380%2C1440%2C900%2C2%2CL; dtv-msg-key-cache=f2f4b6987855de75fb25f643800680fe9e3b7e71; AB_IDPROOT=new_idproot_20190410; AMCV_55633F7A534535110A490D44%40AdobeOrg=1994364360%7CMCIDTS%7C18254%7CMCMID%7C52009180685650076170240414092433544623%7CMCAAMLH-1577719250%7C7%7CMCAAMB-1577719250%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1577121650s%7CNONE%7CMCAID%7CNONE%7CMCCIDH%7C1180585778%7CvVersion%7C3.4.0; dtve-tour-browse=false; mboxEdgeCluster=28; mboxEdgeServer=mboxedge28.tt.omtrdc.net; ak_bmsc=C7C94756B10E5DA089A55AA947F2BE15B81B2D9AA23E000051DB005EC686DC31~plX/JrIfIEE5qEDpad31q7K7HnQYOlGmetUr7EsYOAx0E6ZX8xELzWpWqj5UnP0b1szJBYTzMdl5UtGsf2UR2Vl9bA63qbUFk7OUMwiVneXyf7w9vOhY7R4ZSrD7Hs7Bl2vTNYI2xvmP9XD+3YhR36IPNJ2uZXcIuhYyapVwGQNEeM0ilIZbvcIfF3RME1tq4clKtpCLX8g9NOZo7E1dFsgiDOUBy3OPq1qzCAr0TCkYivUBCbLbjcjSD5YeP9Gmuh; s_dfa=attglobalprod%2Cattconprod; s_visit=1; gpv_v100=DTVE%3AGuide%3AIndex; s_lv_s=Less%20than%207%20days; s_lv=1577114461665; s_vnum30=1579466521346%26vn%3D4; s_invisit30=true; s_vnum90=1584650521354%26vn%3D4; s_invisit90=true; QuantumMetricSessionID=11677a0df063516cfb51987ea7ae1b50; pses={"id":"rreoy2t36e","start":1577114464829,"last":1577114464836}; s_pvs=5; JSESSIONID=Tk22pQbDTTDVRj2V3ztLXj50ggsn2xMhdTgbLSM9Qg5BrzlM7W4F!1544435208; bm_sv=8CB8115A36A2623BC997DDDEDB0E99EC~fUdlKhq9YYc82cSwMEpnooRLEkt2ZXrKwUsbhMnyuslFgraC9PWe97QP181drQ+D+53F2fLe1O03W5kmVmFaPfDdskZWIWvMr8F3K9USriSLqn/FBhTJoRFWM0MVoYtxlAig0SaiMhmiRlquHPrAQnlv7buxy7ndcAs2YwPJ46c=; fsr.s={"v2":-2,"v1":1,"rid":"de358f8-93068815-28fc-e268-6398b","to":5,"c":"https://www.directv.com/guide","pv":8,"f":1577114469671}; RT="z=1&dm=www.directv.com&si=665fda42-1ead-40e3-afab-bf8731b33f82&ss=k4il80gy&sl=1&tt=nk&bcn=%2F%2F17c8edc8.akstat.io%2F"; check=true; mbox=PC#f110a2b53e6548069e07540b12704b71.28_24#1640359272|session#38608d9d1b684aaca07100eae820d6ad#1577116335`
  };
  const method = "get";
  // const timeout = 2000;
  console.log("getting channels....", params, headers);
  console.log("calling...");
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const result = await axios({
      method,
      url,
      params,
      headers,
      // proxy: {
      //   host: 'zproxy.lum-superproxy.io:22225',
      //   port: 22225,
      //   auth: {
      //     // username: 'lum-customer-hl_6316daf2-zone-static_res-ip-38.240.148.202',
      //     // password: '959l49mpzwwb',
      //     username: 'lum-customer-hl_6316daf2-zone-static-ip-158.46.173.186',
      //     password: '959l49mpzwwb',
      //   },
      // },
      proxy: {
        host: "165.227.199.200",
        port: 22225,
        auth: {
          username:
            "http://lum-customer-greatviewseats-zone-tim_zone-country-us-session-0.6399506384454",
          password: "1gjgp252qy4b"
        }
      },
      httpAgent: new http.Agent({
        rejectUnauthorized: false
      }),
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    console.log("back!", result);
  } catch (e) {
    console.error(e.message);
    // console.error(e);
    // console.error(e.getMessage().statusCode);
    // console.error(e.statusMessage);
  }
}

go();
