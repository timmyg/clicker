import { Action } from "@ngrx/store";
import { Plan } from "./plan.model";
import { Timeframe } from "./timeframe.model";

export const SET_PARTNER = "[APP] Set Partner";
export const SET_PARTNER_SUCCESS = "[APP] Set Partner Success";
export const SET_PARTNER_FAIL = "[APP] Set Partner Fail";
export const SET_VERSION = "[APP] Set Version";
export const LOAD_PLANS = "[APP] Load Plans";
export const LOAD_PLANS_SUCCESS = "[APP] Load Plans Success";
export const LOAD_PLANS_FAIL = "[APP] Load Plans Fail";
export const LOAD_TIMEFRAMES = "[APP] Load Timeframes";
export const LOAD_TIMEFRAMES_SUCCESS = "[APP] Load Timeframes Success";
export const LOAD_TIMEFRAMES_FAIL = "[APP] Load Timeframes Fail";
export const CLEAR_TIMEFRAMES = "[APP] Clear Timeframes";
export const CLEAR_PLANS = "[APP] Clear Plans";
export const SEND_MESSAGE = "[APP] Send Message";
export const SEND_MESSAGE_SUCCESS = "[APP] Send Message Success";
export const SEND_MESSAGE_FAIL = "[APP] Send Message Fail";
export const SET_IS_DARK_MODE = "[APP] Set Is Dark Mode";

export class SetPartner implements Action {
  readonly type = SET_PARTNER;
  constructor(public payload: string) {}
}

export class SetPartnerSuccess implements Action {
  readonly type = SET_PARTNER_SUCCESS;
}

export class SetPartnerFail implements Action {
  readonly type = SET_PARTNER_FAIL;
}

export class SetVersion implements Action {
  readonly type = SET_VERSION;
  constructor(public version: string) {}
}

export class LoadPlans implements Action {
  readonly type = LOAD_PLANS;
}

export class LoadPlansSuccess implements Action {
  readonly type = LOAD_PLANS_SUCCESS;
  constructor(public plans: Plan[]) {}
}

export class LoadPlansFail implements Action {
  readonly type = LOAD_PLANS_FAIL;
  constructor(public payload: any) {}
}

export class LoadTimeframes implements Action {
  readonly type = LOAD_TIMEFRAMES;
  constructor(public locationId: string) {}
}

export class LoadTimeframesSuccess implements Action {
  readonly type = LOAD_TIMEFRAMES_SUCCESS;
  constructor(public timeframes: Timeframe[]) {}
}

export class LoadTimeframesFail implements Action {
  readonly type = LOAD_TIMEFRAMES_FAIL;
  constructor(public payload: any) {}
}

export class ClearTimeframes implements Action {
  readonly type = CLEAR_TIMEFRAMES;
}

export class ClearPlans implements Action {
  readonly type = CLEAR_PLANS;
}

export class SendMessage implements Action {
  readonly type = SEND_MESSAGE;
  constructor(public payload: string) {}
}

export class SendMessageSuccess implements Action {
  readonly type = SEND_MESSAGE_SUCCESS;
  constructor(public payload: any) {}
}

export class SendMessageFail implements Action {
  readonly type = SEND_MESSAGE_FAIL;
  constructor(public payload: any) {}
}

export class SetIsDarkMode implements Action {
  readonly type = SET_IS_DARK_MODE;
  constructor(public payload: boolean) {}
}

export type AppActions =
  | SetPartner
  | SetPartnerSuccess
  | SetPartnerFail
  | SetVersion
  | LoadPlans
  | LoadPlansSuccess
  | LoadPlansFail
  | LoadTimeframes
  | LoadTimeframesSuccess
  | LoadTimeframesFail
  | ClearTimeframes
  | ClearPlans
  | SendMessage
  | SendMessageSuccess
  | SendMessageFail
  | SetIsDarkMode;
