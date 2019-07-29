(async () => {
  const Airtable = require('airtable');
  console.log(process.env.airtableKey);
  console.log(process.env.airtableBase);
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const filterByFormula = `DATETIME_DIFF(SET_TIMEZONE({Game Start}, 'America/New_York'),SET_TIMEZONE(NOW(), 'America/New_York'), 'minutes') <= 0`;
  const games = await base('Games')
    .select({
      view: 'Scheduled',
      filterByFormula,
    })
    .all();
  console.log(games.length);
  if (games.length) {
    console.log(games[0].get('Game Start'));
    console.log(games[0].get('Diff'));
  }
  const allGames = await base('Games')
    .select()
    .all();
  //   console.log(allGames);
})();
