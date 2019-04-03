import { Action } from '@ngrx/store';
import { Location } from './location.model';

export const GET_ALL_LOCATIONS = '[LOCATION] Get All Locations';
export const GET_ALL_LOCATIONS_SUCCESS = '[LOCATION] Get All Locations Success';
export const GET_ALL_LOCATIONS_FAIL = '[LOCATION] Get All Locations Fail';

// Get Location List
export class GetAll implements Action {
  readonly type = GET_ALL_LOCATIONS;
}

export class GetAllSuccess implements Action {
  readonly type = GET_ALL_LOCATIONS_SUCCESS;
  constructor(public payload: Location[]) {}
}

export class GetAllFail implements Action {
  readonly type = GET_ALL_LOCATIONS_FAIL;
  constructor(public payload: any) {}
}

export type LocationActions = GetAll | GetAllSuccess | GetAllFail;
