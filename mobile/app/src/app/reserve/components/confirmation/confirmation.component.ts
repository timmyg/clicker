import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import * as moment from 'moment';
import { Reservation } from '../../../state/reservation/reservation.model';
import { ReserveService } from '../../reserve.service';

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

  constructor(private reserveService: ReserveService) {}

  ngOnInit() {
    this.reserveService.emitTitle(this.title);
    this.reservation.details.end = moment()
      .add(2, 'h')
      .minutes(0)
      .toDate();
    this.reservation.details.cost = 2;
  }

  onConfirm() {
    this.saving = true;
    setTimeout(() => {
      this.confirm.emit(this.reservation);
    }, 3000);
  }
}
