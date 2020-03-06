// @flow
class Box {
  id: string;
  clientAddress: string;
  locationName: string;
  label: string;
  tunerBond: boolean;
  setupChannel: number;
  ip: string;
  zone: string;
  notes: string;
  updatedAt: number;
  program: Program;
  appActive: boolean;
  automationActive: boolean;
  channel: number;
  channelChangeAt: number;
  channelChangeSource: string;
  locked: boolean;
  lockedUntilTime: number;
  lockedProgrammingId: string;
  lockedMessage: string;
}

export class Venue {
  id: string;
  losantId: string;
  boxes: Box[];
  channels: {
    exclude: string[],
  };
  packages: string[];
  name: string;
  neighborhood: string;
  geo: {
    latitude: number,
    longitude: number,
  };
  free: boolean;
  img: string;
  region: string;
  active: boolean;
  hidden: boolean;
  demo: boolean;
  connected: boolean;
  setup: boolean;
  controlCenter: boolean;
  controlCenterV2: boolean;
  announcement: string;
  notes: string;
  // calculated fields
  distance: number;
  openTvs: boolean;
  save() {}
}
