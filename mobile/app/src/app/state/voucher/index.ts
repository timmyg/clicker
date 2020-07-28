import { createSelector, createFeatureSelector } from "@ngrx/store";
import * as fromVoucher from "./voucher.reducer";
import { State as VoucherState } from "./voucher.reducer";

export const getVoucherState = createFeatureSelector<VoucherState>("voucher");
export const getLoading = createSelector(getVoucherState, fromVoucher.getLoading);
export const getError = createSelector(getVoucherState, fromVoucher.getError);