import { Location } from "../location/location.model";
import { Program } from "../program/program.model";
import { TV } from "../location/tv.model";

export class Reservation {
  constructor() {}

  id: String;
  location: Location;
  program: Program;
  box: TV;
  start: Date;
  end: Date;
  minutes: Number;
  cost: Number;
  reserve: boolean; // this used?
}
