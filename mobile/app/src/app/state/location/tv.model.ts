export interface TV {
  id: string;
  // clientAddress: number;
  label: string;
  // ip: string;
  // end?: Date;
  // locationName?: string;
  live: {
    locked?: boolean;
    lockedUntil?: Date;
  };
}
