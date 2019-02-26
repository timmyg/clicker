import { Action } from '@ngrx/store';
import { Game } from './game.model';

export const GET_GAMES = '[GAME] Get Games';
export const GET_GAMES_SUCCESS = '[GAME] Get Games Success';
export const GET_GAMES_FAIL = '[GAME] Get Games Fail';

export class GetAllGames implements Action {
  readonly type = GET_GAMES;
}

export class GetAllGamesSuccess implements Action {
  readonly type = GET_GAMES_SUCCESS;
  constructor(public payload: Game[]) {}
}

export class GetAllGamesFail implements Action {
  readonly type = GET_GAMES_FAIL;
  constructor(public payload: any) {}
}

export type GameActions = GetAllGames | GetAllGamesSuccess | GetAllGamesFail;
