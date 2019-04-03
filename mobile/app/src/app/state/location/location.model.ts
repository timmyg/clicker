import { TV } from '../location/tv.model';

export interface Location {
  id: string;
  name: string;
  town: string;
  boxes: TV[];
  distance?: string;
  img?: string;
}
