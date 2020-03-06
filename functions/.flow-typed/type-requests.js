// @flow
export class BoxInfoRequest {
  channel: number;
  channelMinor: number;
  source: string;
  channelChangeAt: number;
  lockedUntil: number;
  lockedProgrammingId: string;
}

export class CheckBoxesInfoRequest {
  losantId: string;
  boxes: [
    {
      boxId: string,
      ip: string,
      client: string,
    },
  ];
}
