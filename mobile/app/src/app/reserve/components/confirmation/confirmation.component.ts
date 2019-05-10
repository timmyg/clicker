import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../../state/reservation/reservation.model';
import { ReserveService } from '../../reserve.service';
import { Observable, interval } from 'rxjs';
import { Store } from '@ngrx/store';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ToastController } from '@ionic/angular';
import { startWith, map, distinctUntilChanged, first, filter } from 'rxjs/operators';
import { isLoggedIn, getUserTokenCount } from 'src/app/state/user';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  reservation$: Observable<Partial<Reservation>>;
  reservationEnd$: Observable<Date>;
  tokenCount$: Observable<number>;
  tokenCount: number;
  isLoggedIn$: Observable<boolean>;
  reservation: Partial<Reservation>;
  title = 'Confirmation';
  isLoggedIn: boolean;
  saving: boolean;
  isEditMode: boolean;
  sufficientFunds: boolean;
  private reservationPlans = [
    {
      tokens: 1,
      title: "Don't reserve",
      minutes: 0,
    },
    {
      tokens: 2,
      title: '30 minutes',
      minutes: 30,
      reserve: true,
    },
    {
      tokens: 4,
      title: '1 hour',
      minutes: 60,
      reserve: true,
    },
  ];

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    public toastController: ToastController,
    private actions$: Actions,
  ) {
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
    this.tokenCount$ = this.store.select(getUserTokenCount);
    this.isLoggedIn$ = this.store.select(isLoggedIn);
  }

  ngOnInit() {
    this.reservation$
      .pipe(
        filter(r => r !== null),
        first(),
      )
      .subscribe(reservation => {
        this.reservation = reservation;
        if (reservation.id) {
          this.isEditMode = true;
        }
      });
    this.tokenCount$.subscribe(tokens => {
      this.tokenCount = tokens;
    });
    this.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  get availablePlans() {
    if (this.isEditMode) {
      this.reservationPlans[0].title = "Don't extend";
      this.reservationPlans[0].tokens = 0;
    }
    return this.reservationPlans;
  }

  onLengthChange(e) {
    const plan = this.reservationPlans.find(p => p.minutes === +e.detail.value);
    this.reservation.cost = plan.tokens;
    // const endTimeInitial = this.reservation.end ? moment(this.reservation.end) : moment();
    this.reservation.minutes = plan.minutes;
    this.reservation.reserve = plan.reserve;
    this.checkWallet();
    this.reservationEnd$ = interval(15 * 1000).pipe(
      startWith(
        this.getInitialEndTime()
          .clone()
          .add(plan.minutes, 'm')
          .toDate(),
      ), // this sets inital value
      map(() => {
        return this.getInitialEndTime()
          .clone()
          .add(plan.minutes, 'm')
          .toDate();
      }),
      distinctUntilChanged(),
    );
  }

  checkWallet() {
    this.tokenCount >= this.reservation.cost ? (this.sufficientFunds = true) : (this.sufficientFunds = false);
  }

  getInitialEndTime() {
    return this.reservation.end ? moment(this.reservation.end) : moment();
  }

  onConfirm() {
    this.saving = true;
    this.isEditMode
      ? this.store.dispatch(new fromReservation.Update(this.reservation))
      : this.store.dispatch(new fromReservation.Create(this.reservation));
    const reservation = this.reservation;
    this.actions$
      .pipe(ofType(fromReservation.CREATE_RESERVATION_SUCCESS, fromReservation.UPDATE_RESERVATION_SUCCESS))
      .pipe(first())
      .subscribe(() => {
        this.store.dispatch(new fromReservation.Start());
        this.router.navigate(['/tabs/profile']);
        this.showTunedToast(reservation.box.label, reservation.program.channelTitle);
      });
    this.actions$
      .pipe(ofType(fromReservation.CREATE_RESERVATION_FAIL, fromReservation.UPDATE_RESERVATION_FAIL))
      .pipe(first())
      .subscribe(() => {
        // this.store.dispatch(new fromReservation.Start());
        // this.router.navigate(['/tabs/profile']);
        this.showErrorToast();
        this.saving = false;
      });
  }

  async showTunedToast(label: string, channelName: string) {
    const toast = await this.toastController.create({
      message: `TV ${label} successfully changed to ${channelName}`,
      duration: 2000,
      cssClass: 'ion-text-center',
    });
    toast.present();
  }

  async showErrorToast() {
    const toast = await this.toastController.create({
      message: `Something went wrong, please try again`,
      duration: 2000,
      cssClass: 'ion-text-center',
      color: 'danger',
    });
    toast.present();
  }
}
