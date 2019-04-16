import { Component, OnInit, Input } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import * as moment from 'moment';
import { ActionSheetController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import * as fromStore from '../../state/app.reducer';
import * as fromReservation from '../../state/reservation/reservation.actions';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit {
  @Input() reservation: Reservation;
  minutesFromNow$: Observable<number>;

  constructor(
    public actionSheetController: ActionSheetController,
    private store: Store<fromStore.AppState>,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit() {
    let refreshSeconds = 30;
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
            this.store.dispatch(new fromReservation.SetForUpdate(this.reservation));
            // this.router.navigate(['/tabs/reserve'], { queryParams: { mode: 'edit' } });
            this.router.navigateByUrl('/tabs/reserve;mode=edit');
            // this.router.navigateByUrl('/tabs/reserve;mode=edit');
            // this.location.go('/tabs/reserve?mode=edit');
            // this.location.go(
            //   this.router.createUrlTree(['/tabs/reserve'], { queryParams: { mode: 'edit' } }).toString(),
            // );
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
