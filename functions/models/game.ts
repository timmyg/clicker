// @flow
class Team {
  id: number;
  score: number;
  name: {
    full: string;
    short: string;
    abbr: string;
    display: string;
  };
  logo: string;
  rank: number;
  book: {
    moneyline: string;
    spread: string;
  };
}

export class GameStatus {
  started: boolean;
  blowout: boolean;
  ended: boolean;
  description: string;
}
export default class Game {
  start: string;
  id: number;
  status: string;
  leagueName: string;
  scoreboard: {
    display: string;
    clock: string;
    period: number;
  };
  broadcast: {
    network: string;
  };
  away: Team;
  home: Team;
  book: {
    total: number;
  };
  summary: GameStatus;
  isOver: boolean;
}
