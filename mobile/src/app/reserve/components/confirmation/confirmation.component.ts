import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import * as moment from 'moment';
import { Reservation } from '../../reservation.model';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  @Output() confirm = new EventEmitter();
  @Input() reservation: Reservation;

  constructor() {}

  ngOnInit() {
    this.reservation.end = moment()
      .add(2, 'h')
      .minutes(0)
      .toDate();
    this.reservation.cost = 2;
  }

  ngOnChanges(): void {
    console.log(this.reservation);
  }

  onConfirm() {
    this.confirm.emit();
  }
}
