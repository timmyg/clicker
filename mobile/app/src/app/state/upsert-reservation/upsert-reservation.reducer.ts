import * as fromReservation from './upsert-reservation.actions';
import { Reservation } from './upsert-reservation.model';

export interface State {
  reservations: Reservation[];
  reservation: Reservation;
  loading: boolean;
  error: string;
}

export const initialState: State = {
  reservations: [],
  reservation: null,
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromReservation.ReservationActions): State {
  switch (action.type) {
    case fromReservation.GET_RESERVATIONS: {
      return {
        ...state,
        loading: true,
      };
    }
    case fromReservation.CREATE_RESERVATION: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromReservation.GET_RESERVATIONS_SUCCESS: {
      return {
        ...state,
        loading: false,
        reservations: action.payload,
      };
    }
    case fromReservation.CREATE_RESERVATION_SUCCESS: {
      return {
        ...state,
        loading: false,

        reservations: [...state.reservations, action.payload],
      };
    }

    case fromReservation.GET_RESERVATIONS_FAIL: {
      return {
        ...state,
        loading: false,
        error: 'error loading reservations',
      };
    }
    case fromReservation.CREATE_RESERVATION_FAIL: {
      return {
        ...state,
        loading: false,
        error: 'error creating reservation',
      };
    }

    default: {
      return state;
    }
  }
}

export const getAllReservations = (state: State) => state.reservations;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
