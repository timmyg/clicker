import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import * as FeedbackActions from './feedback.actions';
import { ProgramService } from '../../core/services/program.service';
import { FeedbackService } from 'src/app/core/services/feedback.service';

@Injectable()
export class FeedbackEffects {
  @Effect()
  submit$: Observable<Action> = this.actions$.pipe(
    ofType(FeedbackActions.SUBMIT_FEEDBACK),
    switchMap((action: FeedbackActions.Submit) =>
      this.feedbackService.submit(action.payload).pipe(
        map((result: any) => new FeedbackActions.SubmitSuccess()),
        catchError(err => of(new FeedbackActions.SubmitFail())),
      ),
    ),
  );

  constructor(private actions$: Actions, private feedbackService: FeedbackService) {}
}
