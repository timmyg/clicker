(async () => {
  const Airtable = require('airtable');
  console.log(process.env.airtableKey);
  console.log(process.env.airtableBase);
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const games = await base('Games')
    .select({
      view: 'Scheduled',
      filterByFormula: `DATETIME_DIFF({Game Start}, DATEADD(NOW(), 1, 'minutes'), 'minutes') <= 0`,
    })
    .all();
  console.log(games.length);
  if (games.length) {
    console.log(games[0].get('Game Start'));
  }
  const allGames = await base('Games')
    .select()
    .all();
  //   console.log(allGames);
})();
