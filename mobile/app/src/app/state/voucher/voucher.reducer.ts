import { createReducer, on } from '@ngrx/store';
import * as VoucherActions from './voucher.actions';

export interface State {
  loaded: boolean;
  loading: boolean;
  error: string;
  alert:{
    title: string,
    message: string,
  };
}

const initialState: State = {
  loaded: false,
  loading: false,
  error: null,
  alert:{
    title: null,
    message: null,
  }
};

export const reducer = createReducer(
  initialState,
  on(VoucherActions.redeem, (state) => ({
    ...state,
    loading: true,
  })),
  on(VoucherActions.redeemSuccess, (state, {alert}) => ({
    ...state,
    loaded: true,
    loading: false,
    alert
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
