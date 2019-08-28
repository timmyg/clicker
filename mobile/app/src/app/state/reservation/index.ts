import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromReservations from './reservation.reducer';
import { State as ReservationState } from './reservation.reducer';

export const getReservationsState = createFeatureSelector<ReservationState>('reservation');

export const getReservation = createSelector(
  getReservationsState,
  fromReservations.getReservation,
);

export const getReservationTvs = createSelector(
  getReservationsState,
  fromReservations.getReservationTvs,
);

export const getAllReservations = createSelector(
  getReservationsState,
  fromReservations.getAllReservations,
);

export const getLoading = createSelector(
  getReservationsState,
  fromReservations.getLoading,
);

export const getError = createSelector(
  getReservationsState,
  fromReservations.getError,
);
