export interface Program {
  id: number;
  title: string;
  description: string;
  start: Date;
  end: Date;
  type: string;
  channelTitle: string;
  channel: number;
  channelMinor: number;
  nextProgramTitle: string;
  nextProgramStart: Date;
  subcategories: [string]; // ["Basketball"] or Cycling, Racing, Football, Baseball
  mainCategory: string; // "Sports" or "TV" or "Movies"
  points: number; // ranking points
  live: boolean;
  repeat: boolean;
  sports: boolean;
  icon: string;
  isSports: boolean;
  game: any;
}
