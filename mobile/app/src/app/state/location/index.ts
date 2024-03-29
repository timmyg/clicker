import { createSelector, createFeatureSelector } from "@ngrx/store";
import * as fromLocations from "./location.reducer";
import { State as LocationState } from "./location.reducer";

export const getLocationsState = createFeatureSelector<LocationState>(
  "location"
);

export const getAllLocations = createSelector(
  getLocationsState,
  fromLocations.getAllLocations
);

export const getDetailsPage = createSelector(
  getLocationsState,
  fromLocations.getDetailsPage
);

export const getDetailsLoading = createSelector(
  getLocationsState,
  fromLocations.getDetailsLoading
);

export const getLoading = createSelector(
  getLocationsState,
  fromLocations.getLoading
);

export const getError = createSelector(
  getLocationsState,
  fromLocations.getError
);
