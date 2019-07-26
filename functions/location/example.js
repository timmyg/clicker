(async () => {
  console.log('at');
  const Airtable = require('airtable');

  console.log(process.env.airtableKey);
  console.log(process.env.airtableBase);
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const games = await base('Games')
    .select({ view: 'Ready To Change' })
    .all();
  console.log(games.length);
  console.log(games[0].get('Game Start'));
})();
