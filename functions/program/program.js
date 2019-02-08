const dynamoose = require('dynamoose');
const axios = require('axios');
const moment = require('moment');
const uuid = require('uuid/v5');
require('dotenv').config();

const Program = dynamoose.model(
  process.env.tableProgram,
  {
    programId: {
      type: String,
      hashKey: true,
    },
    id: {
      type: String,
      // hashKey: true,
      default: uuid,
    },
    description: String, // null
    title: String, // "Oklahoma State @ Kansas"
    duration: Number, // 120
    price: Number, // 0
    repeat: Boolean, // false
    ltd: String, // "Live"
    programID: String, // "SH000296530000"
    blackoutCode: String,
    airTime: Date, // "2019-02-06T18:00:00.000+0000"
    subcategoryList: [String], // ["Basketball"]
    mainCategory: String, // "Sports"
    episodeTitle: String, // "Oklahoma State at Kansas"
    format: String, // "HD"
    mainCategory: String, // "Sports"
    hd: Number, // 1
    liveStreaming: String, // "B"
    rating: String, // "NR (Not Rated)"
  },
  {
    timestamps: true,
    useDocumentTypes: true,
  },
);

function generateResponse(statusCode, body = {}) {
  let msg = body;
  if (typeof msg === 'string') {
    msg = { message: msg };
  }
  return {
    statusCode,
    body: JSON.stringify(msg),
  };
}

module.exports.health = async event => {
  return generateResponse(200, `${process.env.serviceName}: i\'m good (table: ${process.env.tableProgram})`);
};

/**
 * Registers a device if it has not been registered (losantId is PK)
 * @param   {string} losantId device identifier for Losant platform (event.body)
 * @param   {string} location human readable location for reference (event.body)
 *
 * @returns {number} 201, 400
 */
module.exports.pull = async event => {
  try {
    const url = process.env.GUIDE_ENDPOINT;
    const channelsToPull = [206, 209, 208, 219, 9, 19, 12, 5, 611, 618, 660, 701];
    const startTime = moment()
      .utc()
      .subtract(6, 'hours')
      .minutes(0)
      .seconds(0)
      .toString();
    const hours = 24;
    console.log({ url, params: { channels: channelsToPull.join(','), startTime, hours } });
    // const headers = {
    //   Referer: 'https://www.directv.com/assets/js/dtve/apps/guide/programDataServiceProcessor.js',
    //   Accept: '*/*',
    //   'User-Agent':
    //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.81 Safari/537.36',
    //   'Accept-Language': 'en-US,en;q=0.9',
    //   'Accept-Encoding': 'gzip, deflate, br',
    //   Connection: 'keep-alive',
    //   Cookie:
    //     'dtv-lsid=cjrqgcfymqfhp3zqjhroddny2; dtv-msg-key-cache=13d0c256a99295ef6d907cab71ba546e82657f68; DCPROSPECT=DEN; AMCVS_55633F7A534535110A490D44%40AdobeOrg=1; dtve-tour-browse=false; AMCVS_8EAC67C25245B1820A490D4C%40AdobeOrg=1; mt.v=2.835199002.1549291817429; intent=all; mboxEdgeServer=mboxedge17.tt.omtrdc.net; mboxEdgeCluster=28; s_dfa=attglobalprod%2Cattconprod; UUID=b1959776-9252-a374-c005-c6a4458de296; s_cc=true; TLTSID=353520F8288C10280002C83964F474D0; TLTUID=353520F8288C10280002C83964F474D0; JSESSIONID=FfnGcYRS73Q2QHpkk0lRKyhLG121cGT2x2Qj5cpmF1GysPLxvVdk!1538138555; AMCV_55633F7A534535110A490D44%40AdobeOrg=-330454231%7CMCIDTS%7C17932%7CMCMID%7C41353229852579147852885787985274438246%7CMCAAMLH-1549896631%7C7%7CMCAAMB-1549896631%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1549299017s%7CNONE%7CMCAID%7CNONE%7CMCCIDH%7C-1145113629%7CvVersion%7C3.1.2; s_visit=1; s_dl=1; c_m=undefinedTyped%2FBookmarkedTyped%2FBookmarkedundefined; s_channel=%5B%5B%27Typed%2FBookmarked%27%2C%271549291833529%27%5D%5D; gpv_v100=DTVE%3AGuide%3AIndex; s_lv_s=First%20Visit; s_lv=1549291833536; s_vnum30=1551883833537%26vn%3D1; s_invisit30=true; s_vnum90=1557067833539%26vn%3D1; s_invisit90=true; AMCV_8EAC67C25245B1820A490D4C%40AdobeOrg=-330454231%7CMCMID%7C36225899878518120362533829892376293123%7CMCAAMLH-1549896633%7C7%7CMCAAMB-1549896633%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1549299017s%7CNONE%7CvVersion%7C3.1.2%7CMCCIDH%7C2121515433; aam_uuid=41077601763778415392913350291379098692; fsr.s={"v2":-2,"v1":1,"rid":"de358f8-93820646-0ce3-ed2d-2dd40","to":4.2,"c":"https://www.directv.com/guide","pv":2,"f":1549291835453}; check=true; mbox=session#88e3ec1ed241406780f8ce86848dc04c#1549293699|PC#88e3ec1ed241406780f8ce86848dc04c.17_83#1612536637',
    // };
    const params = { channels: channelsToPull.join(','), startTime, hours };
    const result = await axios.get(url, { params });
    const { schedule } = result.data;
    console.info(`pulled ${schedule.length} programs`);
    // schedule.forEach(channel => {
    //   Program.batchPut(channel.schedules);
    // });
    return generateResponse(201);
  } catch (e) {
    console.error(e);
    return generateResponse(400, `Could not create: ${e.stack}`);
  }
};
