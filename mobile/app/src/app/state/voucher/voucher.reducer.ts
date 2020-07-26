import { createReducer, on } from '@ngrx/store';
import * as VoucherActions from './voucher.actions';

export interface State {
  loaded: boolean;
  loading: boolean;
  error: string;
  redeemed: string;
}

const initialState: State = {
  loaded: false,
  loading: false,
  error: null,
  redeemed: null
};

export const reducer = createReducer(
  initialState,
  on(VoucherActions.redeem, (state) => ({
    ...state,
    loading: true,
  })),
  on(VoucherActions.redeemSuccess, (state, {code}) => ({
    ...state,
    loaded: true,
    loading: false,
    redeemed: code
  })),
  on(VoucherActions.redeemFailure, (state, {error}) => ({
    ...state,
    loaded: true,
    loading: false,
    error
  })),
);

export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
