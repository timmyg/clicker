import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { TV } from './tv.model';
import * as TvActions from './tv.actions';
import { TvService } from '../../core/services/tv.service';

@Injectable()
export class TvsEffects {
  @Effect()
  getAllTvs$: Observable<Action> = this.actions$.pipe(
    ofType(TvActions.GET_ALL_TVS),
    switchMap((action: TvActions.GetAllByLocation) =>
      this.tvService.getTvs(action.payload).pipe(
        map((tvs: TV[]) => new TvActions.GetAllByLocationSuccess(tvs)),
        catchError(err => of(new TvActions.GetAllByLocationFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private tvService: TvService) {}
}
