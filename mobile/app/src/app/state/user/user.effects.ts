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
        map((user: any) => {
          console.log(user);
          return new UserActions.LoadWalletSuccess(user);
        }),
        catchError(err => of(new UserActions.LoadWalletFail(err))),
      ),
    ),
  );

  @Effect()
  alias$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.ALIAS),
    switchMap((action: UserActions.Alias) =>
      this.userService.alias(action.fromId, action.toId).pipe(
        switchMap((result: any) => [new UserActions.AliasSuccess(result), new UserActions.Load()]),
        catchError(err => of(new UserActions.LoadFail(err))),
      ),
    ),
  );

  @Effect()
  updateCard$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.UPDATE_CARD),
    switchMap((action: UserActions.UpdateCard) =>
      this.userService.updateCard(action.token).pipe(
        switchMap((result: any) => [new UserActions.UpdateCardSuccess(result), new UserActions.Load()]),
        catchError(err => of(new UserActions.UpdateCardFail(err))),
      ),
    ),
  );

  @Effect()
  addFunds$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.ADD_FUNDS),
    switchMap((action: UserActions.AddFunds) =>
      this.userService.addFunds(action.tokens).pipe(
        switchMap((result: any) => [new UserActions.AddFundsSuccess(result), new UserActions.Load()]),
        catchError(err => of(new UserActions.LoadFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
