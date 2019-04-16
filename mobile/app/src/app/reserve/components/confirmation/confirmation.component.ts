import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../../state/reservation/reservation.model';
import { ReserveService } from '../../reserve.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router } from '@angular/router';
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
  reservationPlans = [
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
  ) {
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
  }

  ngOnInit() {
    this.reservation$.subscribe(reservation => {
      this.reservation = reservation;
    });
  }

  onLengthChange(e) {
    const plan = this.reservationPlans.find(p => p.minutes === +e.detail.value);
    this.reservation.cost = plan.tokens;
    this.reservation.end = moment()
      .add(plan.minutes, 'm')
      .add(1, 'm') // add another minute, just to be nice
      .toDate();
    this.reservation.start = moment().toDate();
    this.reservation.reserve = plan.reserve;
  }

  onConfirm() {
    this.saving = true;
    this.store.dispatch(new fromReservation.Create(this.reservation));
    // TODO subscribe
    setTimeout(() => {
      this.store.dispatch(new fromReservation.Start());
      this.router.navigate(['/tabs/profile']);
    }, 3000);
  }
}
