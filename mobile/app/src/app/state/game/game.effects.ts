import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Game } from './game.model';
import * as GameActions from './game.actions';
import { GameService } from '../../core/services/game.service';

@Injectable()
export class GamesEffects {
  @Effect()
  getAllGames$: Observable<Action> = this.actions$.pipe(
    ofType(GameActions.GET_GAMES),
    switchMap(() =>
      this.gameService.getGames().pipe(
        map((games: Game[]) => new GameActions.GetAllGamesSuccess(games)),
        catchError(err => of(new GameActions.GetAllGamesFail(err))),
      ),
    ),
  );

  constructor(private actions$: Actions, private gameService: GameService) {}
}
