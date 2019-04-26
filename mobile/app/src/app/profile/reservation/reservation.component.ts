import { Component, OnInit, Input } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import * as moment from 'moment';
import { ActionSheetController, ModalController, AlertController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import * as fromStore from '../../state/app.reducer';
import * as fromReservation from '../../state/reservation/reservation.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
  @Input() reservation: Reservation;
  minutesFromNow$: Observable<string>;
  disableModify: boolean;
  editChannelModal;
  editTimeModal;

  constructor(
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
    private store: Store<fromStore.AppState>,
    private router: Router,
    public modalController: ModalController,
  ) {}

  ngOnInit() {
    this.setMinutesRefresher();
  }

  private setMinutesRefresher() {
    let refreshSeconds = 30;
    this.minutesFromNow$ = interval(refreshSeconds * 1000).pipe(
      startWith(this.getTimeRemaining()), // this sets inital value
      map(() => {
        return this.getTimeRemaining();
      }),
      distinctUntilChanged(),
    );
  }

  async showModify() {
    this.disableModify = true;
    const actionSheet = await this.actionSheetController.create({
      header: 'Modify Reservation',
      buttons: [
        {
          text: 'Cancel Reservation',
          role: 'destructive',
          handler: () => {
            this.onReservationCancel(this.reservation);
          },
        },
        {
          text: 'Change Channel',
          handler: () => {
            const reservationToUpdate = Object.assign({}, this.reservation);
            delete reservationToUpdate.program;
            this.store.dispatch(new fromReservation.SetForUpdate(reservationToUpdate));
            this.router.navigate(['/tabs/reserve'], { queryParams: { edit: 'channel' }, skipLocationChange: true });
          },
        },
        {
          text: 'Add Time',
          handler: () => {
            const reservationToUpdate = Object.assign({}, this.reservation);
            this.store.dispatch(new fromReservation.SetForUpdate(reservationToUpdate));
            this.router.navigate(['/tabs/reserve'], { queryParams: { edit: 'time' }, skipLocationChange: true });
          },
        },
      ],
    });
    actionSheet.onDidDismiss().then(() => (this.disableModify = false));
    await actionSheet.present();
  }

  async onReservationCancel(reservation: Reservation) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message:
        'You will not be refunded any tokens, but you will be freeing up a TV for other patrons, which is appreciated ✌️',
      buttons: [
        {
          text: 'Cancel Reservation',
          role: 'destructive',
          cssClass: 'secondary',
          handler: () => {
            this.store.dispatch(new fromReservation.Cancel(reservation));
          },
        },
      ],
    });

    await alert.present();
  }

  modify() {
    this.showModify();
  }

  private getTimeRemaining(): string {
    const endTime = moment(this.reservation.end);
    const duration = moment.duration(endTime.diff(moment()));
    let minutes = Math.ceil(duration.asMinutes());
    if (minutes >= 60) {
      let hours = 0;
      while (minutes >= 60) {
        minutes -= 60;
        hours++;
      }
      let msg = `${hours}h`;
      if (minutes) {
        msg = `${msg} ${minutes}m`;
      }
      return msg;
    }
    // return Math.ceil(duration.asMinutes());
    return `${minutes}m`;
  }
}
