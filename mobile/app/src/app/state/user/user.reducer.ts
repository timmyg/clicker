import * as fromUser from './user.actions';
import { User } from './user.model';

export interface State {
  me: User;
  loading: boolean;
  error: string;
}

export const initialState: State = {
  me: null,
  loading: false,
  error: null,
};

export function reducer(state = initialState, action: fromUser.UserActions): State {
  switch (action.type) {
    case fromUser.LOAD:
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

    case fromUser.LOAD_FAIL:
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
export const getUserTokens = (state: State) => state.me.tokens;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
