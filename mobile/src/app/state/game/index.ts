import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromGames from './game.reducer';
import { State as GameState } from './game.reducer';

export const getGamesState = createFeatureSelector<GameState>('game');

export const getAllGames = createSelector(
  getGamesState,
  fromGames.getAllGames,
);

export const getLoading = createSelector(
  getGamesState,
  fromGames.getLoading,
);

export const getError = createSelector(
  getGamesState,
  fromGames.getError,
);
