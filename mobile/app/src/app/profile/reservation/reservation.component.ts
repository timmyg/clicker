import { Component, OnInit, Input } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import * as moment from 'moment';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
  @Input() reservation: Reservation;
  minutesFromNow$: Observable<number>;

  constructor(public actionSheetController: ActionSheetController) {}

  ngOnInit() {
    console.log(this.reservation);
    let refreshSeconds = 30;
    // if (this.getMinutes() < 10) {
    //   refreshSeconds = 10;
    // }
    this.minutesFromNow$ = interval(refreshSeconds * 1000).pipe(
      startWith(this.getMinutes()), // this sets inital value
      map(() => {
        return this.getMinutes();
      }),
      distinctUntilChanged(),
    );
  }

  async showModify() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Modify Reservation',
      buttons: [
        {
          text: 'Cancel Reservation',
          role: 'destructive',
          handler: () => {
            // TODO
          },
        },
        {
          text: 'Change Channel',
          handler: () => {
            // TODO
          },
        },
        {
          text: 'Add Time',
          handler: () => {
            // TODO
          },
        },
      ],
    });
    await actionSheet.present();
  }

  modify() {
    this.showModify();
  }

  private getMinutes() {
    const endTime = moment(this.reservation.end);
    const duration = moment.duration(endTime.diff(moment()));
    return Math.ceil(duration.asMinutes());
  }
}
