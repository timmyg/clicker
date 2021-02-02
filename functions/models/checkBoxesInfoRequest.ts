class BoxInfoRequest {
  boxId: string;
  ip: string;
  client: string;
}

export default class CheckBoxesInfoRequest {
  losantId: string;
  losantProductionOverride: boolean;
  boxes: BoxInfoRequest[];
}
