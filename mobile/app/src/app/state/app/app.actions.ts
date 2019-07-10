import { Action } from '@ngrx/store';
import { Plan } from './plan.model';

export const SET_PARTNER = '[APP] Set Partner';
export const SET_PARTNER_SUCCESS = '[APP] Set Partner Success';
export const SET_PARTNER_FAIL = '[APP] Set Partner Fail';
export const LOAD_PLANS = '[USER] Load Plans';
export const LOAD_PLANS_SUCCESS = '[USER] Load Plans Success';
export const LOAD_PLANS_FAIL = '[USER] Load Plans Fail';

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

export type AppActions = SetPartner | SetPartnerSuccess | SetPartnerFail | LoadPlans | LoadPlansSuccess | LoadPlansFail;
