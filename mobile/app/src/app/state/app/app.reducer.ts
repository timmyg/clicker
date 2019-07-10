import * as fromApp from './app.actions';
import { Plan } from './plan.model';

export interface State {
  partner: string;
  plans: Plan[];
  loading: boolean;
  error: string;
}

export const initialState: State = {
  partner: null,
  plans: null,
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromApp.AppActions): State {
  switch (action.type) {
    case fromApp.LOAD_PLANS:
      return {
        ...state,
        loading: true,
      };

    case fromApp.SET_PARTNER: {
      state.partner = action.payload;
      return state;
    }
    case fromApp.LOAD_PLANS_SUCCESS:
      return {
        ...state,
        loading: false,
        plans: action.plans,
      };

    case fromApp.LOAD_PLANS_FAIL:
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
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
