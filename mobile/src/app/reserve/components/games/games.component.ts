import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from 'src/app/state/game/game.model';
import { Store } from '@ngrx/store';
import { getAllGames } from 'src/app/state/game';
import * as fromStore from '../../../state/app.reducer';
import * as fromGame from '../../../state/game/game.actions';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  games$: Observable<Game[]>;

  constructor(private store: Store<fromStore.AppState>) {
    this.games$ = this.store.select(getAllGames);
  }

  ngOnInit() {
    this.store.dispatch(new fromGame.GetAllGames());
  }
}
