import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { Game } from 'src/app/state/game/game.model';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit, OnChanges {
  @Output() chooseGame = new EventEmitter<Game>();
  @Input() games: Game[];

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    console.log(this.games);
  }

  onGameClick(game: Game) {
    this.chooseGame.emit(game);
  }
}
