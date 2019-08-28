import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromApp from './app.reducer';
import { State as AppState } from './app.reducer';

export const getAppState = createFeatureSelector<AppState>('app');

export const getPartner = createSelector(
  getAppState,
  fromApp.getPartner,
);

export const getPlans = createSelector(
  getAppState,
  fromApp.getPlans,
);

export const getLoading = createSelector(
  getAppState,
  fromApp.getLoading,
);

export const getTimeframes = createSelector(
  getAppState,
  fromApp.getTimeframes,
);
