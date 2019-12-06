// @flow
export class Reservation {
  userId: string;
  id: string;
  location: Venue;
  box: Box;
  program: Program;
  cost: number;
  minutes: number;
  start: Date;
  end: Date;
  cancelled: boolean;
}
