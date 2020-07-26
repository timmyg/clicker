import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import * as VoucherActions from './voucher.actions'
import { VoucherService } from "src/app/core/services/voucher.service";

@Injectable()
export class VoucherEffects {
  submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VoucherActions.redeem),
      mergeMap(({ code }) =>
        this.voucherService.redeem(code).pipe(
          map((response) => VoucherActions.redeemSuccess({code})),
          catchError((response) => of(VoucherActions.redeemFailure({error: response.message})))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private voucherService: VoucherService
  ) {}
}