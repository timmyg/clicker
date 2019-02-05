import { ActionReducerMap, MetaReducer } from '@ngrx/store';

import * as fromLocation from './location/location.reducer';

export interface AppState {
  location: fromLocation.State;
}
export const appReducer: ActionReducerMap<AppState> = {
  location: fromLocation.reducer,
};
