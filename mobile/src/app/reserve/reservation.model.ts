import { Establishment } from '../state/location/location.model';
import { Game } from '../state/game/game.model';
import { TV } from '../state/tv/tv.model';

export class Reservation {
  constructor() {
    this.activeStep = 'locations';
  }

  activeStep: String;
  location: Establishment;
  game: Game;
  tv: TV;
  start: Date;
  end: Date;
  cost: number;

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
