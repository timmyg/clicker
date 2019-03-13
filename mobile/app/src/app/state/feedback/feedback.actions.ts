import { Action } from '@ngrx/store';

export const SUBMIT_FEEDBACK = '[FEEDBACK] Submit';
export const SUBMIT_FEEDBACK_SUCCESS = '[FEEDBACK] Submit Success';
export const SUBMIT_FEEDBACK_FAIL = '[FEEDBACK] Submit Fail';

export class Submit implements Action {
  readonly type = SUBMIT_FEEDBACK;
  constructor(public payload: string) {}
}

export class SubmitSuccess implements Action {
  readonly type = SUBMIT_FEEDBACK_SUCCESS;
}

export class SubmitFail implements Action {
  readonly type = SUBMIT_FEEDBACK_FAIL;
}

export type FeedbackActions = Submit | SubmitSuccess | SubmitFail;
