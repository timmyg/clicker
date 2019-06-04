import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import * as moment from 'moment';
import { ActionSheetController, ModalController, AlertController, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import * as fromStore from '../../state/app.reducer';
import * as fromReservation from '../../state/reservation/reservation.actions';
import { Router } from '@angular/router';

interface TimeLeft {
  label: string;
  minutes: number;
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
  @Input() reservation: Reservation;
  @Output() onModify = new EventEmitter<Reservation>();
  timeLeft: TimeLeft;
  editChannelModal;
  editTimeModal;
  intervalJobId;

  constructor(
    public alertController: AlertController,
    private store: Store<fromStore.AppState>,
    private router: Router,
    public modalController: ModalController,
    public toastController: ToastController,
  ) {}

  ngOnInit() {
    this.setTimeLeftRefresher();
    const secondsToRefresh = 25;
    this.intervalJobId = setInterval(() => this.setTimeLeftRefresher(), secondsToRefresh * 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalJobId);
  }

  private setTimeLeftRefresher() {
    const endTime = moment(this.reservation.end);
    const duration = moment.duration(endTime.diff(moment()));
    const minutes = Math.ceil(duration.asMinutes());
    this.timeLeft = this.getTimeLeft(minutes);
    if (minutes <= 0) {
      clearInterval(this.intervalJobId);
    }
  }

  modify() {
    this.onModify.emit(this.reservation);
  }

  getTimeLeft(minutes): TimeLeft {
    let label;
    if (minutes >= 60) {
      let minutesRemaining = minutes;
      let hours = 0;
      while (minutesRemaining >= 60) {
        minutesRemaining -= 60;
        hours++;
      }
      label = `${hours}h`;
      if (minutesRemaining) {
        label = `${label} ${minutesRemaining}m`;
      }
    } else {
      // this.timeLeft = { label: `${minutes}m`, minutes };
      label = `${minutes}m`;
    }
    return {
      label,
      minutes,
    };
  }
}
