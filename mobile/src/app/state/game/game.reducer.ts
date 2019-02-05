import * as fromGame from './game.actions';
import { Game } from './game.model';

export interface State {
  games: Game[];
  loading: boolean;
  error: string;
}

export const initialState: State = {
  games: [],
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromGame.GameActions): State {
  switch (action.type) {
    case fromGame.GET_GAMES: {
      console.log('get games...');
      return {
        ...state,
        loading: true,
      };
    }

    case fromGame.GET_GAMES_SUCCESS: {
      console.log('action', action);
      return {
        ...state,
        loading: false,
        games: action.payload,
      };
    }

    case fromGame.GET_GAMES_FAIL: {
      console.log('fail');
      return {
        ...state,
        loading: false,
        error: 'error loading games',
      };
    }

    default: {
      return state;
    }
  }
}

export const getAllGames = (state: State) => state.games;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
