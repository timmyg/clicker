import { Location } from '../location/location.model';
import { Program } from '../program/program.model';
import * as moment from 'moment';
import { TV } from '../location/tv.model';

export class Reservation {
  constructor() {
    this.details = {
      start: moment().toDate(),
      end: moment()
        .add(2, 'h')
        .minutes(0)
        .toDate(),
      tokens: 2,
    };
  }

  id: String;
  location: Location;
  program: Program;
  tv: TV;
  details: {
    start: Date;
    end: Date;
    tokens: number;
  };

  get tvTag() {
    return this.tv.label;
  }

  get locationName() {
    return this.location.name;
  }

  get locationTown() {
    return this.location.town;
  }

  get programTitle() {
    return this.program.title;
  }
}
