import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromApp from './app.reducer';
import { State as AppState } from './app.reducer';

export const getAppState = createFeatureSelector<AppState>('app');

export const getPartner = createSelector(
  getAppState,
  fromApp.getPartner,
);
