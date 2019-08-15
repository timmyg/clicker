import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Location } from './location.model';
import * as LocationActions from './location.actions';
import { LocationService } from '../../core/services/location.service';

@Injectable()
export class LocationsEffects {
  @Effect()
  getAllLocations$: Observable<Action> = this.actions$.pipe(
    ofType(LocationActions.GET_ALL_LOCATIONS),
    switchMap((action: LocationActions.GetAll) =>
      this.locationService.getAll(action.geolocation, action.miles).pipe(
        map((locations: Location[]) => new LocationActions.GetAllSuccess(locations)),
        catchError(err => of(new LocationActions.GetAllFail(err))),
      ),
    ),
  );

  @Effect()
  turnOn$: Observable<Action> = this.actions$.pipe(
    ofType(LocationActions.TURN_ON),
    switchMap((action: LocationActions.TurnOn) =>
      this.locationService.turnOn(action.location.id, action.autotune).pipe(
        map(() => new LocationActions.TurnOnSuccess()),
        catchError(err => of(new LocationActions.TurnOnFail(err))),
      ),
    ),
  );

  @Effect()
  turnOff$: Observable<Action> = this.actions$.pipe(
    ofType(LocationActions.TURN_OFF),
    switchMap((action: LocationActions.TurnOff) =>
      this.locationService.turnOff(action.location.id).pipe(
        map(() => new LocationActions.TurnOffSuccess()),
        catchError(err => of(new LocationActions.TurnOffFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private locationService: LocationService) {}
}
