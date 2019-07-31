(async () => {
  const Airtable = require('airtable');
  console.log(process.env.airtableKey);
  console.log(process.env.airtableBase);
  const base = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  // const filterByFormula = `DATETIME_DIFF(SET_TIMEZONE({Game Start}, 'America/New_York'),SET_TIMEZONE(NOW(), 'America/New_York'), 'minutes') <= 0`;
  let games = await base('Games')
    .select({
      view: 'Scheduled',
      // filterByFormula,
    })
    .all();
  console.log('scheduled', games.length);
  games = games.filter(g => new Date(g.get('Game Start')) <= new Date());
  if (games.length) {
    console.log(games[0].get('Game Start'));
  }
  console.log('scheduled filtered', games.length);
  const allGames = await base('Games')
    .select()
    .all();
  //   console.log(allGames);
})();
