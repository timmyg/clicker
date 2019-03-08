import { Action } from '@ngrx/store';
import { Reservation } from '../reservation/reservation.model';

export class SetReservation implements Action {
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
