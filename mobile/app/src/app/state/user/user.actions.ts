import { Action } from '@ngrx/store';
import { User } from './user.model';

export const LOAD = '[USER] Load';
export const LOAD_SUCCESS = '[USER] Load Success';
export const LOAD_FAIL = '[USER] Load Fail';
export const LOAD_WALLET = '[USER] Load Wallet';
export const LOAD_WALLET_SUCCESS = '[USER] Load Wallet Success';
export const LOAD_WALLET_FAIL = '[USER] Load Wallet Fail';
export const SET_AUTH_TOKEN = '[USER] Set Auth Token';

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

export class LoadWallet implements Action {
  readonly type = LOAD_WALLET;
}

export class LoadWalletSuccess implements Action {
  readonly type = LOAD_WALLET_SUCCESS;
  constructor(public payload: number) {}
}

export class LoadWalletFail implements Action {
  readonly type = LOAD_WALLET_FAIL;
  constructor(public payload: any) {}
}

export class SetAuthToken implements Action {
  readonly type = SET_AUTH_TOKEN;
  constructor(public payload: string) {}
}

export type UserActions =
  | Load
  | LoadSuccess
  | LoadFail
  | LoadWallet
  | LoadWalletSuccess
  | LoadWalletFail
  | SetAuthToken;
