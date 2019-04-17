import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromUser from './user.reducer';
import { State as UserState } from './user.reducer';

export const getUserState = createFeatureSelector<UserState>('user');

export const getUser = createSelector(
  getUserState,
  fromUser.getUser,
);

export const getLoading = createSelector(
  getUserState,
  fromUser.getLoading,
);

export const getError = createSelector(
  getUserState,
  fromUser.getError,
);
