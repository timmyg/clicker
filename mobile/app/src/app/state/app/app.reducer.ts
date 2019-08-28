import * as fromApp from './app.actions';
import { Plan } from './plan.model';
import { Timeframe } from './timeframe.model';

export interface State {
  partner: string;
  plans: Plan[];
  timeframes: Timeframe[];
  loading: boolean;
  error: string;
}

export const initialState: State = {
  partner: null,
  plans: null,
  timeframes: null,
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromApp.AppActions): State {
  switch (action.type) {
    case fromApp.LOAD_PLANS:
    case fromApp.LOAD_TIMEFRAMES:
      return {
        ...state,
        loading: true,
      };

    case fromApp.SET_PARTNER: {
      state.partner = action.payload;
      return state;
    }
    case fromApp.CLEAR_TIMEFRAMES:
      return {
        ...state,
        timeframes: null,
      };
    case fromApp.CLEAR_PLANS:
      return {
        ...state,
        plans: null,
      };
    case fromApp.LOAD_PLANS_SUCCESS:
      return {
        ...state,
        loading: false,
        plans: action.plans,
      };
    case fromApp.LOAD_TIMEFRAMES_SUCCESS:
      return {
        ...state,
        loading: false,
        timeframes: action.timeframes,
      };

    case fromApp.LOAD_PLANS_FAIL:
    case fromApp.LOAD_TIMEFRAMES_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default: {
      return state;
    }
  }
}

export const getPartner = (state: State) => state.partner;
export const getPlans = (state: State) => state.plans;
export const getTimeframes = (state: State) => state.timeframes;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
