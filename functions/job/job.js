require('dotenv').config();
const Airtable = require('airtable');
const { respond, getBody, getPathParameters, invokeFunctionSync } = require('serverless-helpers');

module.exports.health = async event => {
  return respond(200, `hello`);
};

module.exports.controlCenter = async event => {
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  console.log('searching for games to change');
  let games = await base('Games')
    .select({
      view: 'Scheduled',
    })
    .all();
  console.log(`found ${games.length} games`);
  games = games.filter(g => new Date(g.get('Game Start')) <= new Date());
  console.log(`found ${games.length} games now/past`);
  console.log(games);
  let changedCount = 0;
  if (games.length) {
    // loop through games
    for (const game of games) {
      const regions = game.get('Region');
      const region = regions[0];
      const channel = game.get('Channel');
      const zone = +game.get('TV Zone');
      const gameId = game.id;
      console.log(`searching for locations for:`, { region, channel, zone });
      // find locations that are in region and control center enabled
      const result = await invokeFunctionSync(
        `location-${process.env.stage}-controlCenterLocationsByRegion`,
        null,
        { region },
        event.headers,
      );
      const locations = result.data;

      console.log(`found ${locations.length} locations`);
      // loop through locations
      for (const location of locations) {
        // find boxes that have game zone
        const boxes = location.boxes.filter(
          b => b.zone === zone && (!b.reserved || (b.reserved && moment(b.end).diff(moment().toDate()) < 0)),
        );
        console.log(`found ${boxes.length} boxes`);
        // loop through boxes, change to game channel
        for (const box of boxes) {
          const command = 'tune';
          const reservation = {
            location,
            box,
            program: {
              channel: channel.split('-')[0],
              channelMinor: channel.split('-')[1],
            },
          };
          console.log('⚡ ⚡ tuning...');
          console.log('location:', location.name, location.neighborhood);
          console.log('box', box.label, box.ip);
          console.log('channel', channel);
          await invokeFunctionSync(`remote-${process.env.stage}-command`, { reservation, command });
          changedCount++;
        }
      }
      // mark game as completed on airtable
      // TODO maybe delete in future?
      await base('Games').update(gameId, {
        Completed: true,
      });
    }
  }

  return respond(200, { changedCount });
};
