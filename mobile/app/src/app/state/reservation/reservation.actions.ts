import { Action } from '@ngrx/store';
import { Reservation } from './reservation.model';
import { Establishment } from '../location/location.model';
import { Game } from '../game/game.model';
import { TV } from '../tv/tv.model';

export const GET_RESERVATIONS = '[RESERVATION] Get Reservations';
export const GET_RESERVATIONS_SUCCESS = '[RESERVATION] Get Reservations Success';
export const GET_RESERVATIONS_FAIL = '[RESERVATION] Get Reservations Fail';
export const CREATE_RESERVATION = '[RESERVATION] Create Reservation';
export const CREATE_RESERVATION_SUCCESS = '[RESERVATION] Create Reservation Success';
export const CREATE_RESERVATION_FAIL = '[RESERVATION] Create Reservation Fail';
export const SET_RESERVATION_FOR_UPDATE = '[RESERVATION WIZARD] Set Existing Reservation for Update';
export const SET_RESERVATION_LOCATION = '[RESERVATION WIZARD] Set Reservation Location';
export const SET_RESERVATION_CHANNEL = '[RESERVATION WIZARD] Set Reservation Channel';
export const SET_RESERVATION_TV = '[RESERVATION WIZARD] Set Reservation TV';

export class GetAllReservations implements Action {
  readonly type = GET_RESERVATIONS;
}

export class GetAllReservationsSuccess implements Action {
  readonly type = GET_RESERVATIONS_SUCCESS;
  constructor(public payload: Reservation[]) {}
}

export class GetAllReservationsFail implements Action {
  readonly type = GET_RESERVATIONS_FAIL;
  constructor(public payload: any) {}
}

export class CreateReservation implements Action {
  readonly type = CREATE_RESERVATION;
  constructor(public payload: Reservation) {}
}

export class CreateReservationSuccess implements Action {
  readonly type = CREATE_RESERVATION_SUCCESS;
  constructor(public payload: Reservation) {}
}

export class CreateReservationFail implements Action {
  readonly type = CREATE_RESERVATION_FAIL;
  constructor(public payload: any) {}
}

export class SetReservationForUpdate implements Action {
  readonly type = SET_RESERVATION_FOR_UPDATE;
  constructor(public payload: Reservation) {}
}

export class SetReservationLocation implements Action {
  readonly type = SET_RESERVATION_LOCATION;
  constructor(public payload: Establishment) {}
}

export class SetReservationChannel implements Action {
  readonly type = SET_RESERVATION_CHANNEL;
  constructor(public payload: Game) {}
}

export class SetReservationTv implements Action {
  readonly type = SET_RESERVATION_TV;
  constructor(public payload: TV) {}
}

export type ReservationActions =
  | GetAllReservations
  | GetAllReservationsSuccess
  | GetAllReservationsFail
  | CreateReservation
  | CreateReservationSuccess
  | CreateReservationFail
  | SetReservationForUpdate
  | SetReservationLocation
  | SetReservationChannel
  | SetReservationTv;
