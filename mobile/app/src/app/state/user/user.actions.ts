import { Action } from '@ngrx/store';
import { User } from './user.model';

export const LOAD = '[USER] Load';
export const LOAD_SUCCESS = '[USER] Load Success';
export const LOAD_FAIL = '[USER] Load Fail';

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

export type UserActions = Load | LoadSuccess | LoadFail;
