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
  isManager: boolean;
  isVip: boolean;
  update: {
    minutes?: number,
    cost?: number,
    program?: Program,
  };
  createdAt: number;
  updatedAt: number;
}
