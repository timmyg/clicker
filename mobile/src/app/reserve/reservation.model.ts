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
}
