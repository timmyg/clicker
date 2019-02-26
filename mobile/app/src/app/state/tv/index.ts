import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromTvs from './tv.reducer';
import { State as TvState } from './tv.reducer';

export const getTvsState = createFeatureSelector<TvState>('tv');

export const getAllTvs = createSelector(
  getTvsState,
  fromTvs.getAllTvs,
);

export const getLoading = createSelector(
  getTvsState,
  fromTvs.getLoading,
);

export const getError = createSelector(
  getTvsState,
  fromTvs.getError,
);
