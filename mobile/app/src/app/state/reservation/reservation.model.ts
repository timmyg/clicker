import { Location } from '../location/location.model';
import { Program } from '../program/program.model';
import * as moment from 'moment';
import { TV } from '../location/tv.model';

export class Reservation {
  constructor() {}

  id: String;
  location: Location;
  program: Program;
  tv: TV;
  start: Date;
  end: Date;
  cost: Number;
  reserve: boolean;

  get tvTag() {
    return this.tv.label;
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
}
