// @flow
export class Reservation {
  userId: string;
  id: string;
  location: Venue;
  box: Box;
  program: Program;
  cost: number;
  minutes: number;
  start: number;
  end: number;
  cancelled: boolean;
}
