import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Reservation } from './new-reservation.model';
import * as ReservationActions from './new-reservation.actions';
import { ReservationService } from '../../core/services/reservation.service';

@Injectable()
export class ReservationsEffects {
  @Effect()
  getAllReservations$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.GET_RESERVATIONS),
    switchMap(() =>
      this.reservationService.getReservations().pipe(
        map((reservations: Reservation[]) => new ReservationActions.GetAllReservationsSuccess(reservations)),
        catchError(err => of(new ReservationActions.GetAllReservationsFail(err))),
      ),
    ),
  );

  @Effect()
  createReservation$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.CREATE_RESERVATION),
    switchMap((action: ReservationActions.CreateReservation) =>
      this.reservationService.createReservation(action.payload).pipe(
        map((reservation: Reservation) => new ReservationActions.CreateReservationSuccess(reservation)),
        catchError(err => of(new ReservationActions.CreateReservationFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private reservationService: ReservationService) {}
}
