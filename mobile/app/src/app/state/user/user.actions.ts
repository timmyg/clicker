import { Action } from "@ngrx/store";
import { User } from "./user.model";
import { Plan } from "../app/plan.model";

export const LOAD = "[USER] Load";
export const LOAD_SUCCESS = "[USER] Load Success";
export const LOAD_FAIL = "[USER] Load Fail";
export const REFRESH = "[USER] Refresh";
export const REFRESH_SUCCESS = "[USER] Refresh Success";
export const REFRESH_FAIL = "[USER] Refresh Fail";
export const LOAD_WALLET = "[USER] Load Wallet";
export const LOAD_WALLET_SUCCESS = "[USER] Load Wallet Success";
export const LOAD_WALLET_FAIL = "[USER] Load Wallet Fail";
export const SET_AUTH_TOKEN = "[USER] Set Auth Token";
export const SET_GEOLOCATION = "[USER] Set Geolocation";
export const ALIAS = "[USER] Alias";
export const ALIAS_SUCCESS = "[USER] Alias Success";
export const ALIAS_FAIL = "[USER] Alias Fail";
export const UPDATE_CARD = "[USER] Update Card";
export const UPDATE_CARD_SUCCESS = "[USER] Update Card Success";
export const UPDATE_CARD_FAIL = "[USER] Update Card Fail";
export const DELETE_CARD = "[USER] Delete Card";
export const DELETE_CARD_SUCCESS = "[USER] Delete Card Success";
export const DELETE_CARD_FAIL = "[USER] Delete Card Fail";
export const ADD_FUNDS = "[USER] Add Funds";
export const ADD_FUNDS_SUCCESS = "[USER] Add Funds Success";
export const ADD_FUNDS_FAIL = "[USER] Add Funds Fail";
export const ADD_REFERRAL = "[USER] Add Referral";
export const ADD_REFERRAL_SUCCESS = "[USER] Add Referral Success";
export const ADD_REFERRAL_FAIL = "[USER] Add Referral Fail";

export class Load implements Action {
  readonly type = LOAD;
}

export class LoadSuccess implements Action {
  readonly type = LOAD_SUCCESS;
  constructor(public payload: User) {}
}

export class LoadFail implements Action {
  readonly type = LOAD_FAIL;
  constructor(public payload: any) {}
}

export class Refresh implements Action {
  readonly type = REFRESH;
}

export class RefreshSuccess implements Action {
  readonly type = REFRESH_SUCCESS;
  constructor() {}
}

export class RefreshFail implements Action {
  readonly type = REFRESH_FAIL;
  constructor(public payload: any) {}
}

export class LoadWallet implements Action {
  readonly type = LOAD_WALLET;
}

export class LoadWalletSuccess implements Action {
  readonly type = LOAD_WALLET_SUCCESS;
  constructor(public payload: any) {}
}

export class LoadWalletFail implements Action {
  readonly type = LOAD_WALLET_FAIL;
  constructor(public payload: any) {}
}

export class SetAuthToken implements Action {
  readonly type = SET_AUTH_TOKEN;
  constructor(public payload: string) {}
}

export class SetGeolocation implements Action {
  readonly type = SET_GEOLOCATION;
  constructor(public latitude: number, public longitude: number) {}
}

export class Alias implements Action {
  readonly type = ALIAS;
  constructor(public fromId: string, public toId: string) {}
}

export class AliasSuccess implements Action {
  readonly type = ALIAS_SUCCESS;
  constructor(public payload: any) {}
}

export class AliasFail implements Action {
  readonly type = ALIAS_FAIL;
  constructor(public payload: any) {}
}

export class UpdateCard implements Action {
  readonly type = UPDATE_CARD;
  constructor(public token: string) {}
}

export class UpdateCardSuccess implements Action {
  readonly type = UPDATE_CARD_SUCCESS;
  constructor(public payload: any) {}
}

export class UpdateCardFail implements Action {
  readonly type = UPDATE_CARD_FAIL;
  constructor(public payload: any) {}
}

export class DeleteCard implements Action {
  readonly type = DELETE_CARD;
  constructor() {}
}

export class DeleteCardSuccess implements Action {
  readonly type = DELETE_CARD_SUCCESS;
  constructor(public payload: any) {}
}

export class DeleteCardFail implements Action {
  readonly type = DELETE_CARD_FAIL;
  constructor(public payload: any) {}
}

export class AddFunds implements Action {
  readonly type = ADD_FUNDS;
  constructor(public plan: Plan) {}
}

export class AddFundsSuccess implements Action {
  readonly type = ADD_FUNDS_SUCCESS;
  constructor(public payload: any) {}
}

export class AddFundsFail implements Action {
  readonly type = ADD_FUNDS_FAIL;
  constructor(public payload: any) {}
}

export class AddReferral implements Action {
  readonly type = ADD_REFERRAL;
  constructor(public code: string) {}
}

export class AddReferralSuccess implements Action {
  readonly type = ADD_REFERRAL_SUCCESS;
  constructor(public payload: any) {}
}

export class AddReferralFail implements Action {
  readonly type = ADD_REFERRAL_FAIL;
  constructor(public payload: any) {}
}

export type UserActions =
  | Load
  | LoadSuccess
  | LoadFail
  | LoadWallet
  | LoadWalletSuccess
  | LoadWalletFail
  | SetAuthToken
  | SetGeolocation
  | UpdateCard
  | UpdateCardSuccess
  | UpdateCardFail
  | DeleteCard
  | DeleteCardSuccess
  | DeleteCardFail
  | AddFunds
  | AddFundsSuccess
  | AddFundsFail
  | AddReferral
  | AddReferralSuccess
  | AddReferralFail;
