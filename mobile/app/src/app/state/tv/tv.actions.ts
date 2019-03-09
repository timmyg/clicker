import { Action } from '@ngrx/store';
import { TV } from './tv.model';
import { Location } from '../location/location.model';

export const GET_ALL_TVS = '[TV] Get All TVs';
export const GET_ALL_TVS_SUCCESS = '[TV] Get All TVs Success';
export const GET_ALL_TVS_FAIL = '[TV] Get All TVs Fail';

export class GetAllByLocation implements Action {
  readonly type = GET_ALL_TVS;
  constructor(public payload: Location) {}
}

export class GetAllByLocationSuccess implements Action {
  readonly type = GET_ALL_TVS_SUCCESS;
  constructor(public payload: TV[]) {}
}

export class GetAllByLocationFail implements Action {
  readonly type = GET_ALL_TVS_FAIL;
  constructor(public payload: any) {}
}

export type TvActions = GetAllByLocation | GetAllByLocationSuccess | GetAllByLocationFail;
