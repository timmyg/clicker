export interface TV {
  id: string;
  // clientAddress: number;
  label: string;
  // ip: string;
  // end?: Date;
  // locationName?: string;
  status: {
    locked?: boolean;
    lockedUntil?: Date;
    lockedMessage?: string;
  };
}
