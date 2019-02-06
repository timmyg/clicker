import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  @Output() confirm = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onConfirm() {
    this.confirm.emit();
  }
}
