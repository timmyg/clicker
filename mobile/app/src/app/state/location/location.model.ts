import { TV } from '../location/tv.model';

export interface Location {
  id: string;
  losantId: string;
  name: string;
  neighborhood: string;
  boxes: TV[];
  distance?: string;
  img?: string;
}
