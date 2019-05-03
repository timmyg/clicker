import * as fromUser from './user.actions';
import { User } from './user.model';

export interface State {
  me: User;
  tokens: number;
  authToken: string;
  loading: boolean;
  error: string;
}

export const initialState: State = {
  me: null,
  tokens: null,
  authToken: null,
  loading: false,
  error: null,
};

export function reducer(state = initialState, action: fromUser.UserActions): State {
  switch (action.type) {
    case fromUser.LOAD:
    case fromUser.LOAD_WALLET:
      return {
        ...state,
        loading: true,
      };

    case fromUser.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        me: action.payload,
      };
    case fromUser.LOAD_WALLET_SUCCESS:
      // state.tokens = action.payload;
      return {
        ...state,
        loading: false,
      };
    case fromUser.SET_AUTH_TOKEN:
      state.authToken = action.payload;
      return {
        ...state,
      };

    case fromUser.LOAD_FAIL:
    case fromUser.LOAD_WALLET_FAIL:
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

export const getUser = (state: State) => state.me;
export const getUserId = (state: State) => state.me.sub;
export const getUserTokenCount = (state: State) => state.tokens;
export const getUserAuthToken = (state: State) => state.authToken;
export const isLoggedIn = (state: State) => state.me && !state.me.guest;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
