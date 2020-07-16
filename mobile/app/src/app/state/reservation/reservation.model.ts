import { Location } from "../location/location.model";
import { Program } from "../program/program.model";
import { TV } from "../location/tv.model";

export class Reservation {
  constructor(r?: Reservation) {
    Object.assign(this, r);
  }

  id: String;
  location: Location;
  isManager: boolean;
  isVip: boolean;
  program: Program;
  box: TV;
  start: Date;
  end: Date;
  minutes: number;
  cost: number;
  reserve: boolean; // this used?
  minutesUpdated: number;
  costUpdated: number;
  programUpdated: Program;
  update?: {
    minutes?: number;
    cost?: number;
    program?: Program;
  };
  userId: string;
}
