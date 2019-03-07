import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import * as moment from 'moment';
import { Reservation } from '../../../state/reservation/reservation.model';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  @Input() reservation: Reservation;
  @Output() confirm = new EventEmitter<Reservation>(true);
  @Output() changeTitle = new EventEmitter<String>(true);
  title = 'Confirmation';
  saving: boolean;

  constructor() {}

  ngOnInit() {
    this.changeTitle.emit(this.title);
    this.reservation.end = moment()
      .add(2, 'h')
      .minutes(0)
      .toDate();
    this.reservation.cost = 2;
  }

  onConfirm() {
    this.saving = true;
    setTimeout(() => {
      this.confirm.emit(this.reservation);
    }, 3000);
  }
}
