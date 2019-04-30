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
  load$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.LOAD),
    switchMap(() =>
      this.userService.get().pipe(
        switchMap((user: User) => [new UserActions.LoadWalletSuccess(user), new UserActions.LoadSuccess(user)]),
        catchError(err => of(new UserActions.LoadFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
