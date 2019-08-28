import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromLocation from './location/location.reducer';
import * as fromProgram from './program/program.reducer';
import * as fromReservation from './reservation/reservation.reducer';
import * as fromUser from './user/user.reducer';
import * as fromApp from './app/app.reducer';

export interface AppState {
  location: fromLocation.State;
  program: fromProgram.State;
  reservation: fromReservation.State;
  user: fromUser.State;
  app: fromApp.State;
}
export const appReducer: ActionReducerMap<AppState> = {
  location: fromLocation.reducer,
  program: fromProgram.reducer,
  reservation: fromReservation.reducer,
  user: fromUser.reducer,
  app: fromApp.reducer,
};
