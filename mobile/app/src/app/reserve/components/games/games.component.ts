import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { Game } from 'src/app/state/game/game.model';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent {
  @Input() games: Game[];
  @Output() chooseGame = new EventEmitter<Game>(true);
  @Output() changeTitle = new EventEmitter<String>(true);
  title = 'Choose Channel';

  ngOnInit() {
    this.changeTitle.emit(this.title);
  }

  onGameClick(game: Game) {
    this.chooseGame.emit(game);
  }
}
