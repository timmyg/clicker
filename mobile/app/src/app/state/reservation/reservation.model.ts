import { Establishment } from '../location/location.model';
import { Game } from '../game/game.model';
import { TV } from '../tv/tv.model';

export class Reservation {
  id: String;
  location: Establishment;
  game: Game;
  tv: TV;
  details: {
    start: Date;
    end: Date;
    cost: number;
  };

  get tvTag() {
    return this.tv.tag;
  }

  get locationName() {
    return this.location.name;
  }

  get locationTown() {
    return this.location.town;
  }

  get gameTitle() {
    return this.game.title;
  }
}
