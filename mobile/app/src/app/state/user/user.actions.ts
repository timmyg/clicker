import { Action } from '@ngrx/store';
import { User } from './user.model';

export const GET = '[USER] Get';
export const GET_SUCCESS = '[USER] Get Success';
export const GET_FAIL = '[USER] Get Fail';
export const CREATE = '[USER] Create';
export const CREATE_SUCCESS = '[USER] Create Success';
export const CREATE_FAIL = '[USER] Create Fail';

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

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: User) {}
}

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: User) {}
}

export class CreateFail implements Action {
  readonly type = CREATE_FAIL;
  constructor(public payload: any) {}
}

export type UserActions = Get | GetSuccess | GetFail | Create | CreateSuccess | CreateFail;
