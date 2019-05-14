export interface Program {
  id: number;
  title: string;
  start: Date;
  type: string;
  channelTitle: string;
  channel: number;
  channelMinor: number;
  subcategories: [string]; // ["Basketball"] or Cycling, Racing, Football, Baseball
  mainCategory: string; // "Sports" or "TV" or "Movies"
  points: number; // ranking points
  icon: string;
}
