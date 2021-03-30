import Box from './box';

export default class Venue {
  _v: number;
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
    latitude: number;
    longitude: number;
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
  //   save() {}
}
