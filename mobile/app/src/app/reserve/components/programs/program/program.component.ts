import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Program } from 'src/app/state/program/program.model';
import { ReserveService } from 'src/app/reserve/reserve.service';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss'],
})
export class ProgramComponent {
  @Input() program: Program;
  @Output() onSelect = new EventEmitter<Program>();

  constructor() {}

  async onProgramClick() {
    this.onSelect.emit(this.program);
  }

  isReplay() {
    const isSport = this.program.title.indexOf(' @ ') > -1 || this.program.title.indexOf(' at ') > -1;
    if (this.program.repeat && isSport) {
      console.log('true');
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
        return nextProgramTitle.substring(0, maxLength - 3) + '...';
      }
    }
  }
}
