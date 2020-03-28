export interface TV {
  id: string;
  // clientAddress: number;
  label: string;
  // ip: string;
  // end?: Date;
  // locationName?: string;
  info: {
    clientAddress: string; // dtv calls this clientAddr
    // locationName: string, // dtv name
    ip: string;
    // notes: string,
  };
  live: {
    locked?: boolean;
    lockedUntil?: Date;
    lockedMessage?: string;
  };
}
