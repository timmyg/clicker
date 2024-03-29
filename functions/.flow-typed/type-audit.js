// @flow
export class Audit {
  region: string;
  id: string;
  start: number;
  end: number;
  channel: number;
  channelMinor: number;
  channelTitle: string;
  title: string;
  episodeTitle: string;
  description: string;
  durationMins: number;
  live: boolean;
  repeat: boolean;
  sports: boolean;
  programmingId: string;
  channelCategories: string[];
  subcategories: string[];
  mainCategory: string;
  type: string;
  nextProgramTitle: string;
  nextProgramStart: number;
  points: number;
  synced: boolean;
  clickerRating: number;
  gameId: number;
  game: Game;
  createdAt: number;
  updatedAt: number;

  // dynamic
  startFromNow: number;
  endFromNow: number;
  isSports: boolean;
}
