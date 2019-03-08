import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Program } from './program.model';
import * as ProgramActions from './program.actions';
import { ProgramService } from '../../core/services/program.service';

@Injectable()
export class ProgramsEffects {
  @Effect()
  getAllPrograms$: Observable<Action> = this.actions$.pipe(
    ofType(ProgramActions.GET_PROGRAMS),
    switchMap(() =>
      this.programService.getPrograms().pipe(
        map((programs: Program[]) => new ProgramActions.GetAllByLocationSuccess(programs)),
        catchError(err => of(new ProgramActions.GetAllByLocationFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private programService: ProgramService) {}
}
