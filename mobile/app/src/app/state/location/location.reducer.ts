import * as fromLocation from "./location.actions";
import { Location } from "./location.model";

export interface State {
  locations: Location[];
  loading: boolean;
  error: string;
}

export const initialState: State = {
  locations: [],
  loading: false,
  error: ""
};

export function reducer(
  state = initialState,
  action: fromLocation.LocationActions
): State {
  switch (action.type) {
    case fromLocation.GET_ALL_LOCATIONS:
      return {
        ...state,
        loading: true
      };

    case fromLocation.GET_ALL_LOCATIONS_SUCCESS: {
      return {
        ...state,
        loading: false,
        locations: action.payload
      };
    }

    case fromLocation.GET_ALL_LOCATIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: "error!"
      };

    default: {
      return state;
    }
  }
}

export const getAllLocations = (state: State) => state.locations;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
