import { createAction, props } from '@ngrx/store';

export const redeem = createAction(
  '[Voucher] Redeem',
  props<{ code: string }>()
);

export const redeemSuccess = createAction(
  '[Voucher] Redeem Success',
  props<{ code: string }>()
);

export const redeemFailure = createAction(
  '[Voucher] Redeem Failure',
  props<{ error: string }>()
);