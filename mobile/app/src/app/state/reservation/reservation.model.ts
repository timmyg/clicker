import { Location } from '../location/location.model';
import { Program } from '../program/program.model';
import * as moment from 'moment';
import { TV } from '../location/tv.model';

export class Reservation {
  constructor() {}

  id: String;
  location: Location;
  program: Program;
  box: TV;
  start: Date;
  end: Date;
  cost: Number;
  reserve: boolean;

  get tvTag() {
    return this.box.label;
  }

  get locationName() {
    return this.location.name;
  }

  get locationTown() {
    return this.location.neighborhood;
  }

  get programTitle() {
    return this.program.title;
  }

  hasLocation() {
    return this.location && this.location.id;
  }

  hasChannel() {
    return this.program && this.program.channel;
  }

  hasTV() {
    return this.box && this.box.label;
  }
}
