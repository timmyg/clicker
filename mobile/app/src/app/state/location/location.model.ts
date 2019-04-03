import { TV } from '../location/tv.model';

export interface Location {
  id: number;
  name: string;
  town: string;
  boxes: TV[];
  distance?: string;
  img?: string;
}
