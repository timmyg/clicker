import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../../state/reservation/reservation.model';
import { ReserveService } from '../../reserve.service';
import { Observable, interval } from 'rxjs';
import { Store } from '@ngrx/store';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ToastController } from '@ionic/angular';
import { startWith, map, distinctUntilChanged, first, filter } from 'rxjs/operators';
import { isLoggedIn, getUserTokenCount } from 'src/app/state/user';
import { Actions, ofType } from '@ngrx/effects';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from 'src/app/globals';
import { Timeframe } from 'src/app/state/app/timeframe.model';
import { getTimeframes } from 'src/app/state/app';
import * as fromApp from 'src/app/state/app/app.actions';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  timeframes$: Observable<Timeframe[]>;
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
  timeframe0: Timeframe = {
    minutes: 0,
    tokens: 0,
  };

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    public toastController: ToastController,
    private actions$: Actions,
    private segment: SegmentService,
    private globals: Globals,
    private route: ActivatedRoute,
  ) {
    this.timeframes$ = this.store.select(getTimeframes);
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
        this.store.dispatch(new fromApp.LoadTimeframes(reservation.location.id));
        this.reservation = reservation;
        // initialize reservation
        if (this.reservation.location.free) {
          this.reservation.cost = 0;
          this.reservation.minutes = 0;
        } else {
          this.timeframes$
            .pipe(
              filter(t => t !== null),
              first(),
            )
            .subscribe(timeframes => {
              if (this.reservation.minutes !== 0) {
                const timeframe = timeframes[0];
                this.reservation.cost = timeframe.tokens;
                this.reservation.minutes = timeframe.minutes;
              }
            });
        }
        this.route.queryParams.subscribe(params => {
          // this.reservation.minutes = this.reservation.location.minutes;
          if (params && params.edit) {
            if (params.edit === 'channel') {
              this.reservation.minutes = 0;
            }
            // else if (params.edit === 'time') {
            // }
          }
        });
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

  getEndTime() {
    return moment(this.reservation.end)
      .add(this.reservation.minutes.valueOf(), 'minutes')
      .toDate();
  }

  insufficientFunds() {
    return this.tokenCount < this.reservation.cost;
  }

  onConfirm() {
    const { reservation: r } = this;
    this.saving = true;
    this.isEditMode
      ? this.store.dispatch(new fromReservation.Update(r))
      : this.store.dispatch(new fromReservation.Create(r));
    const reservation = r;
    this.actions$
      .pipe(ofType(fromReservation.CREATE_RESERVATION_SUCCESS, fromReservation.UPDATE_RESERVATION_SUCCESS))
      .pipe(first())
      .subscribe(() => {
        if (this.isEditMode) {
          this.segment.track(this.globals.events.reservation.updated, {
            minutes: r.minutes,
            locationName: r.location.name,
            locationNeighborhood: r.location.neighborhood,
            channelName: r.program.channelTitle,
            channelNumber: r.program.channel,
            programName: r.program.title,
            programDescription: r.program.description,
          });
        } else {
          this.segment.track(this.globals.events.reservation.created, {
            minutes: r.minutes,
            locationName: r.location.name,
            locationNeighborhood: r.location.neighborhood,
            channelName: r.program.channelTitle,
            channelNumber: r.program.channel,
            programName: r.program.title,
            programDescription: r.program.description,
          });
        }
        this.store.dispatch(new fromReservation.Start());
        this.router.navigate(['/tabs/profile']);
        this.showTunedToast(reservation.box.label, reservation.program.channelTitle);
      });
    this.actions$
      .pipe(ofType(fromReservation.CREATE_RESERVATION_FAIL, fromReservation.UPDATE_RESERVATION_FAIL))
      .pipe(first())
      .subscribe(() => {
        this.showErrorToast();
        this.saving = false;
      });
  }

  async showTunedToast(label: string, channelName: string) {
    const toast = await this.toastController.create({
      message: `${label} successfully changed to ${channelName}`,
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

  async onTimeframeChange(e) {
    const timeframe = e.detail.value;
    this.reservation.cost = timeframe.tokens;
    this.reservation.minutes = timeframe.minutes;
  }
}
