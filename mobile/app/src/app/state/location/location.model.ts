import { TV } from '../location/tv.model';

export interface Location {
  id: string;
  losantId: string;
  name: string;
  neighborhood: string;
  boxes: TV[];
  distance?: number;
  img: string;
  announcement?: string;
  ip: string;
  zip: number;
  free?: boolean;
  openTvs?: boolean;
  active?: boolean;
  connected?: boolean;
  hidden?: boolean;
}
