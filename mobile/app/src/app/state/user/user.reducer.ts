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
    case fromUser.GET:
    case fromUser.CREATE:
      return {
        ...state,
        loading: true,
      };

    case fromUser.GET_SUCCESS:
    case fromUser.CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        me: action.payload,
      };

    case fromUser.GET_FAIL:
    case fromUser.CREATE_FAIL:
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
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
