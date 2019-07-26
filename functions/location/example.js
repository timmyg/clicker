(async () => {
  const Airtable = require('airtable');
  console.log(process.env.airtableKey);
  console.log(process.env.airtableBase);
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const games = await base('Games')
    // .select({ view: 'Scheduled', filterByFormula: `DATESTR({Game Start}) <= DATESTR(NOW())` })
    .select({ view: 'Scheduled', filterByFormula: `DATETIME_DIFF({Game Start}, NOW(), 'milliseconds') < 0` })
    .all();
  console.log(games.length);
  if (games.length) {
    console.log(games[0].get('Game Start'));
  }
})();
