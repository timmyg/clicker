import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromUser from './user.reducer';
import { State as UserState } from './user.reducer';

export const getUserState = createFeatureSelector<UserState>('user');

export const getUser = createSelector(
  getUserState,
  fromUser.getUser,
);

export const isLoggedIn = createSelector(
  getUserState,
  fromUser.isLoggedIn,
);

export const getUserId = createSelector(
  getUserState,
  fromUser.getUserId,
);

export const getUserAuthToken = createSelector(
  getUserState,
  fromUser.getUserAuthToken,
);

export const getUserTokenCount = createSelector(
  getUserState,
  fromUser.getUserTokenCount,
);

export const getLoading = createSelector(
  getUserState,
  fromUser.getLoading,
);

export const getError = createSelector(
  getUserState,
  fromUser.getError,
);
