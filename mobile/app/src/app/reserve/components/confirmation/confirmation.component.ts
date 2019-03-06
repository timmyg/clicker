import { Component, OnInit } from '@angular/core';
import { Reservation } from '../../../state/reservation/reservation.model';
import { ReserveService } from '../../reserve.service';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';

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

  onConfirm(reservation: Reservation) {
    this.saving = true;
    // TODO subscribe
    this.store.dispatch(new fromReservation.Create(this.reservation));
    setTimeout(() => {
      this.router.navigate(['/tabs/profile']);
    }, 3000);
  }
}
