import * as fromReservation from "./reservation.actions";
import { Reservation } from "./reservation.model";

export interface State {
  reservations: Reservation[];
  reservation: Reservation;
  // reservation: ReservationUpdate;
  // reservation: Partial<Reservation>|ReservationUpdate;
  // reservation: Partial<Reservation|ReservationUpdate>;
  // reservation: Either<Partial<Reservation>, ReservationUpdate>
  updateType: string;
  loading: boolean;
  error: string;
}

export const initialState: State = {
  reservations: null,
  reservation: null,
  updateType: null,
  loading: false,
  error: "",
};

export function reducer(
  state = initialState,
  action: fromReservation.ReservationActions
): State {
  switch (action.type) {
    case fromReservation.START_RESERVATION:
      return {
        ...state,
        reservation: new Reservation(),
        updateType: null,
      };
    case fromReservation.CREATE_RESERVATION:
    case fromReservation.UPDATE_RESERVATION:
    case fromReservation.CANCEL_RESERVATION:
    case fromReservation.GET_RESERVATIONS:
      return {
        ...state,
        loading: true,
      };
    case fromReservation.GET_RESERVATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        reservations: action.payload,
      };
    case fromReservation.UPDATE_RESERVATION_SUCCESS:
    case fromReservation.CREATE_RESERVATION_SUCCESS:
    case fromReservation.CANCEL_RESERVATION_SUCCESS:
      return {
        ...state,
        loading: false,
        // reservations: [...state.reservations, action.payload],
      };
    case fromReservation.SET_RESERVATION_FOR_UPDATE_CHANNEL:
      return {
        ...state,
        loading: false,
        reservation: {
          ...action.reservation,
          // program: null,
        },
        updateType: "channel",
      };
    case fromReservation.SET_RESERVATION_FOR_UPDATE_TIME:
      return {
        ...state,
        loading: false,
        reservation: {
          ...action.reservation,
          // minutes: 0,
          // cost: null
        },
        updateType: "time",
      };
    case fromReservation.SET_RESERVATION_LOCATION_SUCCESS:
      state.reservation.location = action.location;
      state.reservation.isManager = action.isManager;
      state.reservation.isVip = action.isVip;
      return {
        ...state,
        loading: false,
      };
    case fromReservation.SET_RESERVATION_PROGRAM:
      if (!!state.updateType) {
        state.reservation.update = {
          program: action.payload,
        };
      } else {
        state.reservation.program = action.payload;
      }
      return {
        ...state,
        loading: false,
      };
    case fromReservation.SET_RESERVATION_TIMEFRAME:
      if (!!state.updateType) {
        state.reservation.update = {
          cost: action.payload.tokens,
          minutes: action.payload.minutes,
        };
      } else {
        state.reservation.cost = action.payload.tokens;
        state.reservation.minutes = action.payload.minutes;
      }
      return {
        ...state,
        loading: false,
      };
    case fromReservation.SET_RESERVATION_TV:
      state.reservation.box = action.payload;
      return {
        ...state,
        loading: false,
      };
    case fromReservation.GET_RESERVATIONS_FAIL:
    case fromReservation.CREATE_RESERVATION_FAIL:
    case fromReservation.UPDATE_RESERVATION_FAIL:
    case fromReservation.CANCEL_RESERVATION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default: {
      return state;
    }
  }
}

export const getReservation = (state: State) => state.reservation;
export const getReservationUpdateType = (state: State) => state.updateType;
export const getReservationTvs = (state: State) =>
  state.reservation.location.boxes;
export const getAllReservations = (state: State) => state.reservations;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
export const getReservationIsManager = (state: State) => state.reservation && state.reservation.isManager;
