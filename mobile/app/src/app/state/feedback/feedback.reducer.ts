import * as fromFeedback from './feedback.actions';

export interface State {
  loading: boolean;
  error: string;
}

export const initialState: State = {
  loading: false,
  error: '',
};

export function reducer(state = initialState, action: fromFeedback.FeedbackActions): State {
  switch (action.type) {
    case fromFeedback.SUBMIT_FEEDBACK: {
      return {
        ...state,
        loading: true,
      };
    }
    case fromFeedback.SUBMIT_FEEDBACK_SUCCESS: {
      return {
        ...state,
        loading: false,
      };
    }

    case fromFeedback.SUBMIT_FEEDBACK_FAIL: {
      return {
        ...state,
        loading: false,
        error: 'error submitting feedback',
      };
    }

    default: {
      return state;
    }
  }
}

export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
