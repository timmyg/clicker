import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Plan } from './plan.model';
import { Action } from '@ngrx/store';
import * as AppActions from './app.actions';
import { AppService } from 'src/app/core/services/app.service';

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
  constructor(private actions$: Actions, private appService: AppService) {}
}
