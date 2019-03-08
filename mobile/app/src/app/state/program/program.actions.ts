import { Action } from '@ngrx/store';
import { Program } from './program.model';

export const GET_PROGRAMS = '[PROGRAM] Get Programs';
export const GET_PROGRAMS_SUCCESS = '[PROGRAM] Get Programs Success';
export const GET_PROGRAMS_FAIL = '[PROGRAM] Get Programs Fail';

export class GetAllByLocation implements Action {
  readonly type = GET_PROGRAMS;
}

export class GetAllByLocationSuccess implements Action {
  readonly type = GET_PROGRAMS_SUCCESS;
  constructor(public payload: Program[]) {}
}

export class GetAllByLocationFail implements Action {
  readonly type = GET_PROGRAMS_FAIL;
  constructor(public payload: any) {}
}

export type ProgramActions = GetAllByLocation | GetAllByLocationSuccess | GetAllByLocationFail;
