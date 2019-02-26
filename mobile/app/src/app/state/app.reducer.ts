import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromLocation from './location/location.reducer';
import * as fromGame from './game/game.reducer';
import * as fromTv from './tv/tv.reducer';
import * as fromReservation from './reservation/reservation.reducer';

export interface AppState {
  location: fromLocation.State;
  game: fromGame.State;
  tv: fromTv.State;
  reservation: fromReservation.State;
}
export const appReducer: ActionReducerMap<AppState> = {
  location: fromLocation.reducer,
  game: fromGame.reducer,
  tv: fromTv.reducer,
  reservation: fromReservation.reducer,
};
