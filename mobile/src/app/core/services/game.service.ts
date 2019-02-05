import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { Game } from '../../state/game/game.model';
import { delay } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable()
export class GameService {
  private url = 'api/games';
  constructor(private httpClient: HttpClient) {}

  getGames(): Observable<Array<Game>> {
    // return this.httpClient.get<Game[]>(this.url);
    console.log('get games service');
    const game1: Game = {
      id: 1,
      title: 'Xavier at Georgetown',
      type: 'basketball',
      start: moment()
        .hour(20)
        .minutes(0)
        .toDate(),
    };
    const game2: Game = {
      id: 1,
      title: 'West Virginia at Texas Tech',
      type: 'basketball',
      start: moment()
        .hour(20)
        .minutes(0)
        .toDate(),
    };
    const game3: Game = {
      id: 1,
      title: 'North Carolina at Duke',
      type: 'basketball',
      start: moment()
        .hour(20)
        .minutes(30)
        .toDate(),
    };
    const game4: Game = {
      id: 1,
      title: 'LSU at Florida State',
      type: 'basketball',
      start: moment()
        .hour(20)
        .minutes(30)
        .toDate(),
    };
    const game5: Game = {
      id: 1,
      title: 'Kansas at Oklahoma State',
      type: 'basketball',
      start: moment()
        .hour(20)
        .minutes(0)
        .toDate(),
    };
    const game6: Game = {
      id: 1,
      title: 'Cincinnati at Memphis',
      type: 'basketball',
      start: moment()
        .hour(20)
        .minutes(0)
        .toDate(),
    };
    const game7: Game = {
      id: 1,
      title: 'St. Marys at Gonzaga',
      type: 'basketball',
      start: moment()
        .hour(22)
        .minutes(0)
        .toDate(),
    };
    console.log('........');
    return of([game1, game2, game3, game4, game5, game6, game7]).pipe(delay(1000));
  }
}
