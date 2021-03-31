// @flow

class BoxLive {
  channel: number;
  channelMinor: number;
  channelChangeAt: number;
  channelChangeSource: string;
  locked: boolean;
  appLocked: boolean;
  lockedUntil: number;
  lockedProgrammingIds: string[];
  lockedMessage: string;
  updatedAt: number;
}

class Box {
  id: string;
  label: string;
  zone: string;
  configuration: {
    appActive: boolean,
    automationActive: boolean,
  };
  info: {
    clientAddress: string,
    locationName: string,
    ip: string,
    notes: string,
  };
  live: BoxLive;
  updatedAt: number;
}

class DirecTVBox {
  boxId: string;
  info: DirecTVBoxRaw;
}

class DirecTVBoxRaw {
  major: number;
  minor: number;
  clientAddr: string;
  ip: string;
}

class Base {
  _v: number;
}
export class Venue extends Base {
  id: string;
  shortId: string;
  losantId: string;
  boxes: Box[];
  // channels: {
  //   exclude: string[],
  // };
  packages: string[];
  name: string;
  neighborhood: string;
  geo: {
    latitude: number,
    longitude: number,
  };
  free: boolean;
  losantProductionOverride: boolean;
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
