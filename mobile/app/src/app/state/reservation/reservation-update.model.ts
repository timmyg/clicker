import { Reservation } from "./reservation.model";
import { Program } from '../program/program.model';

export interface ReservationUpdate extends Reservation {
  updatedMinutes: number;
  updatedPorgram: Program;
}
