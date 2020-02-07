import {
  Component,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  OnInit
} from "@angular/core";
import { Program } from "src/app/state/program/program.model";
import { IonItemSliding } from "@ionic/angular";

@Component({
  selector: "app-program",
  templateUrl: "./program.component.html",
  styleUrls: ["./program.component.scss"]
})
export class ProgramComponent implements OnInit {
  @Input() program: Program;
  @Output() onSelect = new EventEmitter<Program>();
  @Output() onInfo = new EventEmitter<Program>();
  vegas: string = null;
  vegasOverUnder: string = null;

  ngOnInit() {
    this.setVegas()
  }

  async onProgramClick() {
    this.onSelect.emit(this.program);
  }

  isReplay() {
    const isSport =
      this.program.title.indexOf(" @ ") > -1 ||
      this.program.title.indexOf(" at ") > -1;
    if (this.program.repeat && isSport) {
      return true;
    }
  }

  getNextProgramTitle() {
    const maxLength = 25;
    const { nextProgramTitle } = this.program;
    if (nextProgramTitle) {
      if (nextProgramTitle.length < maxLength) {
        return nextProgramTitle;
      } else {
        return nextProgramTitle.substring(0, maxLength - 3) + "...";
      }
    }
  }

  onMoreInfo(slidingItem) {
    this.onInfo.emit(this.program);
    slidingItem.close();
  }

  setVegas() {
    try {
      const game = this.program && this.program.game
      if (game && game.home) {
        this.vegas = `${game.home.name.abbr} ${game.home.book.spread} (${game.home.book.moneyline})`
        this.vegasOverUnder = `${game.book.total}`
      }
    } catch (e) {
      console.error('vegas error', e)
   }
  }
}
