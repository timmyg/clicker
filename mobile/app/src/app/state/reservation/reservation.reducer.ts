import * as fromReservation from './reservation.actions';
import { Reservation } from './reservation.model';

export interface State {
  reservations: Reservation[];
  reservationToUpdate: Partial<Reservation>;
  loading: boolean;
  error: string;
}

export const initialState: State = {
  reservations: [],
  reservationToUpdate: null,
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromReservation.ReservationActions): State {
  switch (action.type) {
    case fromReservation.START_RESERVATION: {
      return {
        ...state,
        reservationToUpdate: new Reservation(),
        loading: true,
      };
    }
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
    case fromReservation.SET_RESERVATION_FOR_UPDATE: {
      return {
        ...state,
        loading: false,
        reservationToUpdate: action.payload,
      };
    }
    case fromReservation.SET_RESERVATION_LOCATION: {
      console.log(action);
      state.reservationToUpdate.location = action.payload;
      return {
        ...state,
        loading: false,
      };
    }
    case fromReservation.SET_RESERVATION_PROGRAM: {
      state.reservationToUpdate.program = action.payload;
      return {
        ...state,
        loading: false,
      };
    }
    case fromReservation.SET_RESERVATION_TV: {
      state.reservationToUpdate.tv = action.payload;
      return {
        ...state,
        loading: false,
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

export const getReservation = (state: State) => state.reservationToUpdate;
export const getAllReservations = (state: State) => state.reservations;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
