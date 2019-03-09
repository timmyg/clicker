import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromLocation from './location/location.reducer';
import * as fromProgram from './program/program.reducer';
import * as fromTv from './tv/tv.reducer';
import * as fromReservation from './reservation/reservation.reducer';

export interface AppState {
  location: fromLocation.State;
  program: fromProgram.State;
  tv: fromTv.State;
  reservation: fromReservation.State;
}
export const appReducer: ActionReducerMap<AppState> = {
  location: fromLocation.reducer,
  program: fromProgram.reducer,
  tv: fromTv.reducer,
  reservation: fromReservation.reducer,
};
