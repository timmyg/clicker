import { Action } from '@ngrx/store';
import { User } from './user.model';

export const GET = '[USER] Get';
export const GET_SUCCESS = '[USER] Get Success';
export const GET_FAIL = '[USER] Get Fail';

export class Get implements Action {
  readonly type = GET;
}

export class GetSuccess implements Action {
  readonly type = GET_SUCCESS;
  constructor(public payload: User) {}
}

export class GetFail implements Action {
  readonly type = GET_FAIL;
  constructor(public payload: any) {}
}

export type UserActions = Get | GetSuccess | GetFail;
