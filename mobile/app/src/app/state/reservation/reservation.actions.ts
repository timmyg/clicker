import { Action } from '@ngrx/store';
import { Reservation } from './reservation.model';
import { Location } from '../location/location.model';
import { Program } from '../program/program.model';
import { TV } from '../location/tv.model';

export const GET_RESERVATIONS = '[RESERVATION] Get Reservations';
export const GET_RESERVATIONS_SUCCESS = '[RESERVATION] Get Reservations Success';
export const GET_RESERVATIONS_FAIL = '[RESERVATION] Get Reservations Fail';
export const CREATE_RESERVATION = '[RESERVATION] Create Reservation';
export const CREATE_RESERVATION_SUCCESS = '[RESERVATION] Create Reservation Success';
export const CREATE_RESERVATION_FAIL = '[RESERVATION] Create Reservation Fail';
export const START_RESERVATION = '[RESERVATION WIZARD] Start New Reservation';
export const SET_RESERVATION_FOR_UPDATE = '[RESERVATION WIZARD] Set Existing Reservation for Update';
export const SET_RESERVATION_LOCATION = '[RESERVATION WIZARD] Set Reservation Location';
export const SET_RESERVATION_LOCATION_SUCCESS = '[RESERVATION] Set Reservation Location Success';
export const SET_RESERVATION_LOCATION_FAIL = '[RESERVATION] Set Reservation Location Fail';
export const SET_RESERVATION_PROGRAM = '[RESERVATION WIZARD] Set Reservation Program';
export const SET_RESERVATION_TV = '[RESERVATION WIZARD] Set Reservation TV';

export class Start implements Action {
  readonly type = START_RESERVATION;
}

export class GetAll implements Action {
  readonly type = GET_RESERVATIONS;
}

export class GetAllSuccess implements Action {
  readonly type = GET_RESERVATIONS_SUCCESS;
  constructor(public payload: Reservation[]) {}
}

export class GetAllFail implements Action {
  readonly type = GET_RESERVATIONS_FAIL;
  constructor(public payload: any) {}
}

export class Create implements Action {
  readonly type = CREATE_RESERVATION;
  constructor(public payload: Partial<Reservation>) {}
}

export class CreateSuccess implements Action {
  readonly type = CREATE_RESERVATION_SUCCESS;
  constructor(public payload: Reservation) {}
}

export class CreateFail implements Action {
  readonly type = CREATE_RESERVATION_FAIL;
  constructor(public payload: any) {}
}

export class SetForUpdate implements Action {
  readonly type = SET_RESERVATION_FOR_UPDATE;
  constructor(public payload: Reservation) {}
}

export class SetLocation implements Action {
  readonly type = SET_RESERVATION_LOCATION;
  constructor(public payload: Location) {}
}

export class SetLocationSuccess implements Action {
  readonly type = SET_RESERVATION_LOCATION_SUCCESS;
  constructor(public payload: Location) {}
}

export class SetLocationFail implements Action {
  readonly type = SET_RESERVATION_LOCATION_FAIL;
  constructor(public payload: any) {}
}

export class SetProgram implements Action {
  readonly type = SET_RESERVATION_PROGRAM;
  constructor(public payload: Program) {}
}

export class SetTv implements Action {
  readonly type = SET_RESERVATION_TV;
  constructor(public payload: TV) {}
}

export type ReservationActions =
  | Start
  | GetAll
  | GetAllSuccess
  | GetAllFail
  | Create
  | CreateSuccess
  | CreateFail
  | SetForUpdate
  | SetLocation
  | SetLocationSuccess
  | SetLocationFail
  | SetProgram
  | SetTv;
