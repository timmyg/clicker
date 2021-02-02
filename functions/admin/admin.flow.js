// @flow
const Airtable: any = require('airtable');
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const fetch = require('node-fetch');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const airtableControlCenter = 'Control Center';

declare class process {
  static env: {
    airtableKey: string,
    airtableBase: string,
    stage: string,
  };
}

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.checkControlCenterEvents = RavenLambdaWrapper.handler(Raven, async event => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  let games = await base(airtableControlCenter)
    .select({
      filterByFormula: `AND( {rating} >= 3, {startHoursFromNow} >= 0, {startHoursFromNow} <= 16 )`,
    })
    .all();
  console.log(`found ${games.length} games`);
  console.log(games);
  if (games.length >= 3) {
    await sendControlCenterSlack(`${games.length} games scheduled for next 12 hours`);
  } else {
    const text = `*${games.length}* games scheduled for next 12 hours!`;
    await sendControlCenterSlack(text);
    await new Invoke()
      .service('notification')
      .name('sendTasks')
      .body({ text, importance: 1 })
      .async()
      .go();
  }
  return respond(200);
});

module.exports.logChannelChange = RavenLambdaWrapper.handler(Raven, async event => {
  console.log(getBody(event));
  const body = getBody(event);
  const location: Venue = body.location;
  const box: Box = body.box;
  const program: Program = body.program;
  const { time = new Date(), type } = getBody(event);

  console.time('send to airtable');
  console.log({ location, box, program, time, type });
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);

  const locationName = `${location.name} (${location.neighborhood})`;
  const airtableChannelChanges = 'Channel Changes';

  const newChannelChange = await base(airtableChannelChanges).create(
    {
      Location: locationName,
      Zone: box.zone,
      Channel: program.channel,
      'Channel Title': program.channelTitle,
      Rating: program.clickerRating || 0,
      Program: program.title,
      'Program Start': new Date(program.start),
      'Program End': new Date(program.end),
      Game: JSON.stringify(program.game),
      Time: time,
      Type: type,
      'Box Id': box.id,
    },
    { typecast: true },
  );
  console.timeEnd('send to airtable');

  console.log('try to find last record to update end');
  const lastChannelChanges: any[] = await base(airtableChannelChanges)
    .select({
      filterByFormula: `AND( {Record Id} != '${newChannelChange.id}', {Box Id} = '${box.id}', {Zone} = '${box.zone}', {End} = BLANK() )`,
      sort: [{ field: 'Time', direction: 'desc' }],
      maxRecords: 1,
    })
    .all();
  console.log({ lastChannelChanges });
  if (lastChannelChanges && lastChannelChanges.length) {
    const [lastChannelChange] = lastChannelChanges;
    await base(airtableChannelChanges).update(lastChannelChange.id, {
      End: new Date(),
    });
  }

  return respond(200);
});

module.exports.airtableRemoveExpired = RavenLambdaWrapper.handler(Raven, async event => {
  const tableNames = ['Channel Changes', 'Control Center', 'Games', 'Now Showing'];
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  let count = 0;
  for (const tableName of tableNames) {
    console.log({ tableName });
    const expired = await base(tableName)
      .select({ view: 'Expired' })
      .all();
    const expiredIds = expired.map(g => g.id);
    console.log('expiredIds.length', expiredIds.length);
    const promises = [];
    while (!!expiredIds.length) {
      try {
        const expiredSlice = expiredIds.splice(0, 10);
        count += expiredSlice.length;
        promises.push(base(tableName).destroy(expiredSlice));
        await Promise.all(promises);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return respond(200, { count });
});

async function sendControlCenterSlack(text) {
  await new Invoke()
    .service('notification')
    .name('sendControlCenter')
    .body({ text })
    .async()
    .go();
}
