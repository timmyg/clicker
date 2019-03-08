import { Location } from '../location/location.model';
import { Program } from '../program/program.model';
import { TV } from '../tv/tv.model';

export class Reservation {
  id: String;
  location: Location;
  program: Program;
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

  get programTitle() {
    return this.program.title;
  }
}
