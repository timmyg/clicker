import { TV } from '../location/tv.model';

export interface Location {
  id: string;
  losantId: string;
  name: string;
  neighborhood: string;
  boxes: TV[];
  cost: number;
  distance?: number;
  img: string;
  ip: string;
  zip: number;
  minutes: number;
  active?: boolean;
  connected?: boolean;
}
