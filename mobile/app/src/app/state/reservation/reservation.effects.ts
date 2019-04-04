import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Reservation } from './reservation.model';
import * as ReservationActions from './reservation.actions';
import { ReservationService } from '../../core/services/reservation.service';
import { LocationService } from 'src/app/core/services/location.service';
import { Location } from '../location/location.model';

@Injectable()
export class ReservationsEffects {
  @Effect()
  getAllReservations$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.GET_RESERVATIONS),
    switchMap(() =>
      this.reservationService.getAll().pipe(
        map((reservations: Reservation[]) => new ReservationActions.GetAllSuccess(reservations)),
        catchError(err => of(new ReservationActions.GetAllFail(err))),
      ),
    ),
  );

  @Effect()
  createReservation$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.CREATE_RESERVATION),
    switchMap((action: ReservationActions.Create) =>
      this.reservationService.create(action.payload).pipe(
        map((reservation: Reservation) => new ReservationActions.CreateSuccess(reservation)),
        catchError(err => of(new ReservationActions.CreateFail(err))),
      ),
    ),
  );

  @Effect()
  setLocation$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.SET_RESERVATION_LOCATION),
    switchMap((action: ReservationActions.SetLocation) =>
      this.locationService.get(action.payload.id).pipe(
        map((location: Location) => new ReservationActions.SetLocationSuccess(location)),
        catchError(err => of(new ReservationActions.SetLocationFail(err))),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private reservationService: ReservationService,
    private locationService: LocationService,
  ) {}
}
