// @flow
class Team {
  id: number;
  score: number;
  name: {
    full: string,
    short: string,
    abbr: string,
    display: string,
  };
  logo: string;
  rank: number;
  book: {
    moneyline: number,
    spread: number,
  };
}

export class Game {
  start: string;
  id: number;
  status: string;
  leagueName: string;
  scoreboard: {
    display: string,
    clock: string,
    period: number,
  };
  broadcast: {
    network: string,
  };
  away: Team;
  home: Team;
  book: {
    total: number,
  };
}
