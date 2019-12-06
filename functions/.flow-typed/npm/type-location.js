// @flow
class Box {
  id: string;
  clientAddress: string;
  locationName: string;
  label: string;
  tunerBond: boolean;
  setupChannel: number;
  ip: string;
  reserved: boolean;
  end: Date;
  zone: string;
  notes: string;
  appActive: boolean;
  channel: number;
  channelChangeAt: Date;
  updatedAt: Date;
  channelSource: string;
}

class BoxV2 {
  id: string;
  about: {
    clientAddress: string,
    locationName: string,
    label: string,
    setupChannel: number,
    ip: string,
    notes: string,
  };
  controlCenter: {
    zone: string,
  };
  userControl: {
    // clicker tv app
    active: boolean, // formerly appActive
    reserved: boolean,
    end: Date,
  };
  current: {
    channel: number,
    channelChangeAt: Date,
    updatedAt: Date,
    channelSource: string,
  };
}

export class Venue {
  id: string;
  losantId: string;
  boxes: Array<Box>;
  boxesV2: BoxV2[];
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
  connected: boolean;
  setup: boolean;
  controlCenter: boolean;
  announcement: string;
  notes: string;
  // calculated fields
  distance: number;
  openTvs: boolean;
}
