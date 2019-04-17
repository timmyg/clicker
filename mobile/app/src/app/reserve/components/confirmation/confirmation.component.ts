import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../../state/reservation/reservation.model';
import { ReserveService } from '../../reserve.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  reservation$: Observable<Partial<Reservation>>;
  reservation: Partial<Reservation>;
  title = 'Confirmation';
  saving: boolean;
  isEditMode: boolean;
  initialEndTime: Date;
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
    private route: ActivatedRoute,
  ) {
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
  }

  ngOnInit() {
    this.reservation$.subscribe(reservation => {
      this.initialEndTime = reservation.end;
      this.reservation = reservation;
      if (reservation.id) {
        this.isEditMode = true;
      }
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
    const endTimeInitial = this.initialEndTime ? moment(this.initialEndTime) : moment();
    this.reservation.end = endTimeInitial.add(plan.minutes, 'm').toDate();
    this.reservation.start = moment().toDate();
    this.reservation.reserve = plan.reserve;
  }

  onConfirm() {
    this.saving = true;
    this.isEditMode
      ? this.store.dispatch(new fromReservation.Update(this.reservation))
      : this.store.dispatch(new fromReservation.Create(this.reservation));
    // TODO subscribe
    setTimeout(() => {
      this.store.dispatch(new fromReservation.Start());
      this.router.navigate(['/tabs/profile']);
    }, 3000);
  }
}
