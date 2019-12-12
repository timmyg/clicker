console.log(4);
(async () => {
  console.log('1');
  require('dotenv').config({ path: '../.env' });
  const Airtable = require('airtable');
  const programmingId = 'SH033462440000';
  const airtableBase = new Airtable({ apiKey: process.env.airtableKey }).base(process.env.airtableBase);
  const airtablePrograms = 'Programs';
  console.log('call');
  const airtableGames = await airtableBase(airtablePrograms)
    .select({
      filterByFormula: `{programmingId}='${programmingId}'`,
    })
    .all();
  console.log({ airtableGames });
})();
