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
        // initialize reservation
        this.reservation.cost = this.reservation.location.cost;
        this.route.queryParams.subscribe(params => {
          this.reservation.minutes = this.reservation.location.minutes;
          if (params && params.edit) {
            if (params.edit === 'channel') {
              this.reservation.minutes = 0;
            } else if (params.edit === 'time') {
            }
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

  hasSufficientFunds() {
    return this.tokenCount >= this.reservation.cost;
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
