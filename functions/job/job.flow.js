// @flow
const Airtable = require('airtable');
const moment = require('moment');
const { respond, Invoke, Raven, RavenLambdaWrapper } = require('serverless-helpers');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));
const airtableControlCenter = 'Control Center';

declare class process {
  static env: {
    stage: string,
    airtableKey: string,
    airtableBase: string,
  };
}

class GameStatus {
  started: boolean;
  ended: boolean;
  blowout: boolean;
  description: string;
}

module.exports.health = RavenLambdaWrapper.handler(Raven, async event => {
  return respond(200, `hello`);
});

module.exports.syncLocationsBoxes = RavenLambdaWrapper.handler(Raven, async event => {
  const { data: allRegions } = await new Invoke()
    .service('program')
    .name('regions')
    .go();
  const allRegionIds = allRegions.map(r => r.id);

  const { data: locations }: { data: Venue[] } = await new Invoke()
    .service('location')
    .name('controlCenterLocationsByRegion')
    .pathParams({ regions: allRegionIds })
    .headers(event.headers)
    .go();
  for (location of locations) {
    const { losantId } = location;
    console.log(`sync box (${location.name}):`, { losantId });
    await new Invoke()
      .service('remote')
      .name('syncWidgetBoxes')
      .body({ losantId })
      .async()
      .go();
    const text = `Boxes Synced @ ${location.name} (${location.neighborhood})`;
    await new Invoke()
      .service('notification')
      .name('sendAntenna')
      .body({ text })
      .async()
      .go();
  }
  return respond(200);
});
