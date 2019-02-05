import { Action } from '@ngrx/store';
import { Establishment } from './location.model';

export const GET_ALL_LOCATIONS = '[LOCATION] Get All Locations';
export const GET_ALL_LOCATIONS_SUCCESS = '[LOCATION] Get All Locations Success';
export const GET_ALL_LOCATIONS_FAIL = '[LOCATION] Get All Locations Fail';

//Get Location List
export class GetAllLocations implements Action {
  readonly type = GET_ALL_LOCATIONS;
}

export class GetAllLocationsSuccess implements Action {
  readonly type = GET_ALL_LOCATIONS_SUCCESS;
  constructor(public payload: Establishment[]) {}
}

export class GetAllLocationsFail implements Action {
  readonly type = GET_ALL_LOCATIONS_FAIL;
  constructor(public payload: any) {}
}

export type LocationActions = GetAllLocations | GetAllLocationsSuccess | GetAllLocationsFail;
