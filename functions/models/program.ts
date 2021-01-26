import Game from './game';

export default class Program {
  region: string;
  id: string;
  start: number;
  startOriginal: number;
  end: number;
  channel: number;
  channelId: number;
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
  points: number;
  synced: boolean;
  clickerRating: number;
  gameId: number;
  game: Game;
  createdAt: number;
  updatedAt: number;
  isSports: boolean;

  // dynamic
  startFromNow: number;
  endFromNow: number;
  nextProgramTitle: string;
  nextProgramStart: number;
}
