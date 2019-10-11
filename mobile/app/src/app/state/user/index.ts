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

export const getUserLocations = createSelector(
  getUserState,
  fromUser.getUserLocations,
);

export const getUserRoles = createSelector(
  getUserState,
  fromUser.getUserRoles,
);

export const getUserId = createSelector(
  getUserState,
  fromUser.getUserId,
);

export const getUserGeolocation = createSelector(
  getUserState,
  fromUser.getUserGeolocation,
);

export const getUserAuthToken = createSelector(
  getUserState,
  fromUser.getUserAuthToken,
);

export const getUserReferralCode = createSelector(
  getUserState,
  fromUser.getUserReferralCode,
);

export const isReferred = createSelector(
  getUserState,
  fromUser.isReferred,
);

export const getUserTokenCount = createSelector(
  getUserState,
  fromUser.getUserTokenCount,
);

export const getUserCard = createSelector(
  getUserState,
  fromUser.getUserCard,
);

export const getLoading = createSelector(
  getUserState,
  fromUser.getLoading,
);

export const getError = createSelector(
  getUserState,
  fromUser.getError,
);
