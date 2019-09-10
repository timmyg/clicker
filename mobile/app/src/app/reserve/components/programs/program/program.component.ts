import { Component, Input, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { Program } from 'src/app/state/program/program.model';
import { IonItemSliding } from '@ionic/angular';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss'],
})
export class ProgramComponent {
  @Input() program: Program;
  // @ViewChild('slidingItem', { static: false }) itemSliding: IonItemSliding;
  @ViewChild('slidingItem', { static: false }) itemSliding: IonItemSliding;
  @Output() onSelect = new EventEmitter<Program>();
  @Output() onInfo = new EventEmitter<Program>();

  constructor() {}

  ngAfterViewInit() {
    this.itemSliding.open('start');
    setTimeout(() => this.itemSliding.close(), 2000);
  }

  async onProgramClick() {
    this.onSelect.emit(this.program);
  }

  isReplay() {
    const isSport = this.program.title.indexOf(' @ ') > -1 || this.program.title.indexOf(' at ') > -1;
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
        return nextProgramTitle.substring(0, maxLength - 3) + '...';
      }
    }
  }

  onMoreInfo(slidingItem) {
    this.onInfo.emit(this.program);
    slidingItem.close();
  }
}
