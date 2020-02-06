import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Observable, of } from "rxjs";
import { switchMap, catchError } from "rxjs/operators";
import { Plan } from "./plan.model";
import { Action } from "@ngrx/store";
import * as AppActions from "./app.actions";
import { AppService } from "src/app/core/services/app.service";
import { MessageService } from "src/app/core/services/message.service";
import { Timeframe } from "./timeframe.model";

@Injectable()
export class AppEffects {
  @Effect()
  loadPlans$: Observable<Action> = this.actions$.pipe(
    ofType(AppActions.LOAD_PLANS),
    switchMap(() =>
      this.appService.getPlans().pipe(
        switchMap((plans: Plan[]) => [new AppActions.LoadPlansSuccess(plans)]),
        catchError(err => of(new AppActions.LoadPlansFail(err)))
      )
    )
  );
  @Effect()
  setVersion$: Observable<Action> = this.actions$.pipe(
    ofType(AppActions.SET_VERSION),
    switchMap(() =>
      this.appService.getPlans().pipe(
        switchMap((plans: Plan[]) => [new AppActions.LoadPlansSuccess(plans)]),
        catchError(err => of(new AppActions.LoadPlansFail(err)))
      )
    )
  );
  @Effect()
  loadTimeframes$: Observable<Action> = this.actions$.pipe(
    ofType(AppActions.LOAD_TIMEFRAMES),
    switchMap((action: AppActions.LoadTimeframes) =>
      this.appService.getTimeframes(action.locationId).pipe(
        switchMap((timeframes: Timeframe[]) => [
          new AppActions.LoadTimeframesSuccess(timeframes)
        ]),
        catchError(err => of(new AppActions.LoadTimeframesFail(err)))
      )
    )
  );
  @Effect()
  sendMessage$: Observable<Action> = this.actions$.pipe(
    ofType(AppActions.SEND_MESSAGE),
    switchMap((action: AppActions.SendMessage) =>
      this.messageService.send(action.payload).pipe(
        switchMap((result: boolean) => [
          new AppActions.SendMessageSuccess(result)
        ]),
        catchError(err => of(new AppActions.SendMessageFail(err)))
      )
    )
  );
  constructor(
    private actions$: Actions,
    private appService: AppService,
    private messageService: MessageService
  ) {}
}
