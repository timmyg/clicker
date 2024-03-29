import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import * as decode from "jwt-decode";

import * as UserActions from "./user.actions";
import * as ReservationActions from "../reservation/reservation.actions";
import { UserService } from "src/app/core/services/user.service";

@Injectable()
export class UserEffects {
  // @Effect()
  // refresh$: Observable<Action> = this.actions$.pipe(
  //   ofType(UserActions.REFRESH),
  //   switchMap(() =>
  //     this.userService.refresh().pipe(
  //       switchMap(() => [new UserActions.RefreshSuccess(), new UserActions.Load()]),
  //       catchError(err => of(new UserActions.RefreshFail(err))),
  //     ),
  //   ),
  // );

  @Effect()
  load$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.LOAD),
    switchMap(() =>
      this.userService.get().pipe(
        switchMap((authToken: string) => [
          new UserActions.SetAuthToken(authToken),
          new UserActions.LoadSuccess(decode(authToken)),
          new UserActions.LoadWallet(),
          new ReservationActions.GetAll()
        ]),
        catchError(err => of(new UserActions.LoadFail(err)))
      )
    )
  );

  @Effect()
  loadWallet$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.LOAD_WALLET),
    switchMap(() =>
      this.userService.getWallet().pipe(
        map((user: any) => {
          return new UserActions.LoadWalletSuccess(user);
        }),
        catchError(err => of(new UserActions.LoadWalletFail(err)))
      )
    )
  );

  @Effect()
  alias$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.ALIAS),
    switchMap((action: UserActions.Alias) =>
      this.userService.alias(action.fromId, action.toId).pipe(
        switchMap((result: any) => [
          new UserActions.AliasSuccess(result),
          new UserActions.Load()
        ]),
        catchError(err => of(new UserActions.LoadFail(err)))
      )
    )
  );

  @Effect()
  updateCard$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.UPDATE_CARD),
    switchMap((action: UserActions.UpdateCard) =>
      this.userService.updateCard(action.token).pipe(
        switchMap((result: any) => [
          new UserActions.UpdateCardSuccess(result),
          new UserActions.Load()
        ]),
        catchError(err => of(new UserActions.UpdateCardFail(err)))
      )
    )
  );

  @Effect()
  deleteCard$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.DELETE_CARD),
    switchMap(() =>
      this.userService.removeCard().pipe(
        switchMap((result: any) => [
          new UserActions.DeleteCardSuccess(result),
          new UserActions.Load()
        ]),
        catchError(err => of(new UserActions.UpdateCardFail(err)))
      )
    )
  );

  @Effect()
  addFunds$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.ADD_FUNDS),
    switchMap((action: UserActions.AddFunds) =>
      this.userService.addFunds(action.plan).pipe(
        switchMap((result: any) => [
          new UserActions.AddFundsSuccess(result),
          new UserActions.Load()
        ]),
        catchError((err: UserActions.AddFundsFail) =>
          of(new UserActions.AddFundsFail(err))
        )
      )
    )
  );

  @Effect()
  addReferral$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.ADD_REFERRAL),
    switchMap((action: UserActions.AddReferral) =>
      this.userService.addReferral(action.code).pipe(
        switchMap((result: any) => [
          new UserActions.AddReferralSuccess(result),
          new UserActions.LoadWallet()
        ]),
        catchError((err: UserActions.AddReferralFail) =>
          of(new UserActions.AddReferralFail(err))
        )
      )
    )
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
