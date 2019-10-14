## jobs, for reference

#### update game status _every minute_

check airtable for games, call si.com api, update airtable

#### control center _every 5 mins_

check airtable for game to change, call remote, location, slack functions

#### check dtv box info _every 5 mins_

call every locations device via mqtt for every box, callback with each box info

#### sync descriptions for programs _every 5 mins_

get unsynced descriptions, call directv api

#### sync programs for guide _every 30 mins_

get location zips, call directv api for programs

#### control center daily channel reset _every day_

check airtable for game to change, call remote, location, slack functions

#### check control center has events _every day_

looks at airtable, sees if there's data in a view, slack function
