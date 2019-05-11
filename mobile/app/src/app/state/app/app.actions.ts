import { Action } from '@ngrx/store';

export const SET_PARTNER = '[APP] Set Partner';
export const SET_PARTNER_SUCCESS = '[APP] Set Partner Success';
export const SET_PARTNER_FAIL = '[APP] Set Partner Fail';

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

export type AppActions = SetPartner | SetPartnerSuccess | SetPartnerFail;
