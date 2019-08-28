import { Action } from '@ngrx/store';
import { Location } from './location.model';
import { Geolocation } from './geolocation.model';

export const GET_ALL_LOCATIONS = '[LOCATION] Get All Locations';
export const GET_ALL_LOCATIONS_SUCCESS = '[LOCATION] Get All Locations Success';
export const GET_ALL_LOCATIONS_FAIL = '[LOCATION] Get All Locations Fail';
export const TURN_ON = '[LOCATION] Turn On Locations';
export const TURN_ON_SUCCESS = '[LOCATION] Turn On Locations Success';
export const TURN_ON_FAIL = '[LOCATION] Turn On Locations Fail';
export const TURN_OFF = '[LOCATION] Turn Off';
export const TURN_OFF_SUCCESS = '[LOCATION] Turn Off Success';
export const TURN_OFF_FAIL = '[LOCATION] Turn Off Fail';

// Get Location List
export class GetAll implements Action {
  readonly type = GET_ALL_LOCATIONS;
  constructor(public geolocation?: Geolocation, public miles?: number) {}
}

export class GetAllSuccess implements Action {
  readonly type = GET_ALL_LOCATIONS_SUCCESS;
  constructor(public payload: Location[]) {}
}

export class GetAllFail implements Action {
  readonly type = GET_ALL_LOCATIONS_FAIL;
  constructor(public payload: any) {}
}

export class TurnOn implements Action {
  readonly type = TURN_ON;
  constructor(public location: Location, public autotune?: boolean) {}
}

export class TurnOnSuccess implements Action {
  readonly type = TURN_ON_SUCCESS;
  constructor() {}
}

export class TurnOnFail implements Action {
  readonly type = TURN_ON_FAIL;
  constructor(public payload: any) {}
}

export class TurnOff implements Action {
  readonly type = TURN_OFF;
  constructor(public location: Location) {}
}

export class TurnOffSuccess implements Action {
  readonly type = TURN_OFF_SUCCESS;
  constructor() {}
}

export class TurnOffFail implements Action {
  readonly type = TURN_OFF_FAIL;
  constructor(public payload: any) {}
}

export type LocationActions =
  | GetAll
  | GetAllSuccess
  | GetAllFail
  | TurnOn
  | TurnOnSuccess
  | TurnOnFail
  | TurnOff
  | TurnOffSuccess
  | TurnOffFail;
