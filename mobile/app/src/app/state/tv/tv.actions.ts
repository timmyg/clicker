import { Action } from '@ngrx/store';
import { TV } from './tv.model';

export const GET_ALL_TVS = '[TV] Get All TVs';
export const GET_ALL_TVS_SUCCESS = '[TV] Get All TVs Success';
export const GET_ALL_TVS_FAIL = '[TV] Get All TVs Fail';

export class GetAllTvs implements Action {
  readonly type = GET_ALL_TVS;
}

export class GetAllTvsSuccess implements Action {
  readonly type = GET_ALL_TVS_SUCCESS;
  constructor(public payload: TV[]) {}
}

export class GetAllTvsFail implements Action {
  readonly type = GET_ALL_TVS_FAIL;
  constructor(public payload: any) {}
}

export type TvActions = GetAllTvs | GetAllTvsSuccess | GetAllTvsFail;
