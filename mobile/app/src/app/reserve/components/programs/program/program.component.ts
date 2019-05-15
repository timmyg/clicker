import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Program } from 'src/app/state/program/program.model';

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
}
