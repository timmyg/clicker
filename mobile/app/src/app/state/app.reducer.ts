import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromLocation from './location/location.reducer';
import * as fromProgram from './program/program.reducer';
import * as fromReservation from './reservation/reservation.reducer';

export interface AppState {
  location: fromLocation.State;
  program: fromProgram.State;
  reservation: fromReservation.State;
}
export const appReducer: ActionReducerMap<AppState> = {
  location: fromLocation.reducer,
  program: fromProgram.reducer,
  reservation: fromReservation.reducer,
};
