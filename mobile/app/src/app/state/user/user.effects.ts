import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as decode from 'jwt-decode';

// import { User } from './user.model';
import * as UserActions from './user.actions';
import { UserService } from 'src/app/core/services/user.service';

@Injectable()
export class UserEffects {
  @Effect()
  load$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.LOAD),
    switchMap(() =>
      this.userService.get().pipe(
        switchMap((authToken: string) => [
          new UserActions.SetAuthToken(authToken),
          new UserActions.LoadSuccess(decode(authToken)),
          new UserActions.LoadWallet(),
        ]),
        catchError(err => of(new UserActions.LoadFail(err))),
      ),
    ),
  );

  @Effect()
  loadWallet$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.LOAD_WALLET),
    switchMap(() =>
      this.userService.getWallet().pipe(
        map((tokens: number) => {
          return new UserActions.LoadWalletSuccess(tokens);
        }),
        catchError(err => of(new UserActions.LoadWalletFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
