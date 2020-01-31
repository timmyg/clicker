// @flow
const Airtable: any = require('airtable');
const { getBody, respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const fetch = require('node-fetch');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const airtableControlCenterV1 = 'Control Center v1';

declare class process {
  static env: {
    airtableKey: string,
    airtableBase: string,
    circleToken: string,
    stage: string,
  };
}

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

// ccv1
module.exports.checkControlCenterEvents = RavenLambdaWrapper.handler(Raven, async event => {
  // check if any scheduled events for control center today
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  // find games scheduled for the next 24 hours
  let games = await base(airtableControlCenterV1)
    .select({
      view: 'Scheduled',
      filterByFormula: `AND( {Started Hours Ago} <= 0, {Started Hours Ago} > -14 )`,
    })
    .all();
  console.log(`found ${games.length} games`);
  console.log(games);
  if (!!games.length) {
    await sendControlCenterSlack(`*${games.length}* games scheduled today`);
  } else {
    await sendControlCenterSlack(`No games scheduled today`);
  }
  return respond(200);
});

module.exports.runEndToEndTests = RavenLambdaWrapper.handler(Raven, async event => {
  const { circleToken, stage } = process.env;

  const body = {
    parameters: {
      trigger: false,
      'e2e-app': true,
    },
    branch: stage === 'prod' ? 'master' : stage,
  };

  await fetch(`https://circleci.com/api/v2/project/github/teamclicker/clicker/pipeline`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Basic ${Buffer.from(circleToken).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

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

  // const programUsed = box.program || program;
  // const programUsed = program;
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
      filterByFormula: `AND( {Record Id} != '${newChannelChange.id}', {Box Id} = '${box.id}', {Zone} = '${
        box.zone
      }', {End} = BLANK() )`,
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
  const tableNames = ['Control Center v1', 'Channel Changes', 'Control Center', 'Games', 'Now Showing'];
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
