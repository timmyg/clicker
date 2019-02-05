import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromLocation from './location/location.reducer';
import * as fromGame from './game/game.reducer';

export interface AppState {
  location: fromLocation.State;
  game: fromGame.State;
}
export const appReducer: ActionReducerMap<AppState> = {
  location: fromLocation.reducer,
  game: fromGame.reducer,
};
