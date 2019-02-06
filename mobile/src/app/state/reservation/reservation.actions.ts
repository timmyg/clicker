import { Action } from '@ngrx/store';
import { Reservation } from './reservation.model';

export const GET_RESERVATIONS = '[RESERVATION] Get Reservations';
export const GET_RESERVATIONS_SUCCESS = '[RESERVATION] Get Reservations Success';
export const GET_RESERVATIONS_FAIL = '[RESERVATION] Get Reservations Fail';
export const CREATE_RESERVATION = '[RESERVATION] Create Reservation';
export const CREATE_RESERVATION_SUCCESS = '[RESERVATION] Create Reservation Success';
export const CREATE_RESERVATION_FAIL = '[RESERVATION] Create Reservation Fail';

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

export type ReservationActions =
  | GetAllReservations
  | GetAllReservationsSuccess
  | GetAllReservationsFail
  | CreateReservation
  | CreateReservationSuccess
  | CreateReservationFail;
