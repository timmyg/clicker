import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";

import { Reservation } from "./reservation.model";
import * as ReservationActions from "./reservation.actions";
import * as UserActions from "../user/user.actions";
import { ReservationService } from "../../core/services/reservation.service";
import { LocationService } from "src/app/core/services/location.service";
import { Location } from "../location/location.model";

@Injectable()
export class ReservationsEffects {
  @Effect()
  getAllReservations$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.GET_RESERVATIONS),
    switchMap(() =>
      this.reservationService.getActiveByUser().pipe(
        map(
          (reservations: Reservation[]) =>
            new ReservationActions.GetAllSuccess(reservations)
        ),
        catchError(err => of(new ReservationActions.GetAllFail(err)))
      )
    )
  );

  @Effect()
  createReservation$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.CREATE_RESERVATION),
    switchMap((action: ReservationActions.Create) =>
      this.reservationService.create(action.payload).pipe(
        switchMap((reservation: Reservation) => [
          new ReservationActions.CreateSuccess(reservation),
          new UserActions.LoadWallet(),
          new ReservationActions.GetAll()
        ]),
        catchError(err => of(new ReservationActions.CreateFail(err)))
      )
    )
  );

  @Effect()
  updateReservation$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.UPDATE_RESERVATION),
    switchMap((action: ReservationActions.Update) =>
      this.reservationService.update(action.payload).pipe(
        switchMap((reservation: Reservation) => [
          new ReservationActions.UpdateSuccess(reservation),
          new UserActions.LoadWallet(),
          new ReservationActions.GetAll()
        ]),
        catchError(err => of(new ReservationActions.UpdateFail(err)))
      )
    )
  );

  @Effect()
  cancelReservation$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.CANCEL_RESERVATION),
    switchMap((action: ReservationActions.Cancel) =>
      this.reservationService.cancel(action.payload).pipe(
        switchMap(() => [
          new ReservationActions.CancelSuccess(),
          new ReservationActions.GetAll()
        ]),
        catchError(err => of(new ReservationActions.CancelFail(err)))
      )
    )
  );

  @Effect()
  setLocation$: Observable<Action> = this.actions$.pipe(
    ofType(ReservationActions.SET_RESERVATION_LOCATION),
    switchMap((action: ReservationActions.SetLocation) => {
      // console.log({action});
      return this.locationService
        .get(action.location.id, action.latitude, action.longitude)
        .pipe(
          map(
            (location: Location) =>
              new ReservationActions.SetLocationSuccess(location, action.isManager, action.isVip)
          ),
          catchError(err => of(new ReservationActions.SetLocationFail(err)))
        )
          }
    )
  );

  constructor(
    private actions$: Actions,
    private reservationService: ReservationService,
    private locationService: LocationService
  ) {}
}
