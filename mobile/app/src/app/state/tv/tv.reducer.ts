import * as fromTv from './tv.actions';
import { TV } from './tv.model';

export interface State {
  tvs: TV[];
  loading: boolean;
  error: string;
}

export const initialState: State = {
  tvs: [],
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromTv.TvActions): State {
  switch (action.type) {
    case fromTv.GET_ALL_TVS: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromTv.GET_ALL_TVS_SUCCESS: {
      return {
        ...state,
        loading: false,
        tvs: action.payload,
      };
    }

    case fromTv.GET_ALL_TVS_SUCCESS: {
      return {
        ...state,
        loading: false,
        error: 'error loading tvs',
      };
    }

    default: {
      return state;
    }
  }
}

export const getAllTvs = (state: State) => state.tvs;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
