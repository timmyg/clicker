import Program from './program';

export default class BoxLive {
  channel: number;
  channelMinor: number;
  channelChangeAt: number;
  channelChangeSource: string;
  locked: boolean;
  appLocked: boolean;
  lockedUntil: number;
  lockedProgrammingIds: string[];
  lockedMessage: string;
  program: Program;
}
