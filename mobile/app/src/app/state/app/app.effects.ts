import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Plan } from './plan.model';
import { Action } from '@ngrx/store';
import * as AppActions from './app.actions';
import { AppService } from 'src/app/core/services/app.service';
import { Timeframe } from './timeframe.model';

@Injectable()
export class AppEffects {
  @Effect()
  loadPlans$: Observable<Action> = this.actions$.pipe(
    ofType(AppActions.LOAD_PLANS),
    switchMap(() =>
      this.appService.getPlans().pipe(
        switchMap((plans: Plan[]) => [new AppActions.LoadPlansSuccess(plans)]),
        catchError(err => of(new AppActions.LoadPlansFail(err))),
      ),
    ),
  );
  @Effect()
  loadTimeframes$: Observable<Action> = this.actions$.pipe(
    ofType(AppActions.LOAD_TIMEFRAMES),
    switchMap((action: AppActions.LoadTimeframes) =>
      this.appService.getTimeframes(action.locationId).pipe(
        switchMap((timeframes: Timeframe[]) => [new AppActions.LoadTimeframesSuccess(timeframes)]),
        catchError(err => of(new AppActions.LoadTimeframesFail(err))),
      ),
    ),
  );
  constructor(private actions$: Actions, private appService: AppService) {}
}
