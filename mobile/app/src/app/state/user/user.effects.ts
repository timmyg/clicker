import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { User } from './user.model';
import * as UserActions from './user.actions';
import { UserService } from 'src/app/core/services/user.service';

@Injectable()
export class UserEffects {
  @Effect()
  get$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.GET),
    switchMap(() =>
      this.userService.get().pipe(
        map((user: User) => new UserActions.GetSuccess(user)),
        catchError(err => of(new UserActions.GetFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
