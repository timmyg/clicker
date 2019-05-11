import * as fromApp from './app.actions';

export interface State {
  partner: string;
  loading: boolean;
  error: string;
}

export const initialState: State = {
  partner: null,
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromApp.AppActions): State {
  switch (action.type) {
    case fromApp.SET_PARTNER: {
      state.partner = action.payload;
      return state;
    }

    default: {
      return state;
    }
  }
}

export const getPartner = (state: State) => state.partner;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
