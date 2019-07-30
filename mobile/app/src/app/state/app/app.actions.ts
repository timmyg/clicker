import { Action } from '@ngrx/store';
import { Plan } from './plan.model';
import { Timeframe } from './timeframe.model';
import { Location } from '../location/location.model';

export const SET_PARTNER = '[APP] Set Partner';
export const SET_PARTNER_SUCCESS = '[APP] Set Partner Success';
export const SET_PARTNER_FAIL = '[APP] Set Partner Fail';
export const LOAD_PLANS = '[APP] Load Plans';
export const LOAD_PLANS_SUCCESS = '[APP] Load Plans Success';
export const LOAD_PLANS_FAIL = '[APP] Load Plans Fail';
export const LOAD_TIMEFRAMES = '[APP] Load Timeframes';
export const LOAD_TIMEFRAMES_SUCCESS = '[APP] Load Timeframes Success';
export const LOAD_TIMEFRAMES_FAIL = '[APP] Load Timeframes Fail';

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

export type AppActions =
  | SetPartner
  | SetPartnerSuccess
  | SetPartnerFail
  | LoadPlans
  | LoadPlansSuccess
  | LoadPlansFail
  | LoadTimeframes
  | LoadTimeframesSuccess
  | LoadTimeframesFail;
