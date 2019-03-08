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
    switchMap(() =>
      this.locationService.getLocations().pipe(
        map((locations: Location[]) => new LocationActions.GetAllSuccess(locations)),
        catchError(err => of(new LocationActions.GetAllFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private locationService: LocationService) {}
}
