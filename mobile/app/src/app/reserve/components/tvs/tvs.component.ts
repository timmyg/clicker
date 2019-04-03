import { Component } from '@angular/core';
import { TV } from 'src/app/state/location/tv.model';
import { Observable } from 'rxjs';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Store } from '@ngrx/store';
import { ReserveService } from '../../reserve.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as fromStore from '../../../state/app.reducer';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { getReservation, getReservationTvs } from 'src/app/state/reservation';

@Component({
  selector: 'app-tvs',
  templateUrl: './tvs.component.html',
  styleUrls: ['./tvs.component.scss'],
})
export class TvsComponent {
  tvs$: Observable<TV[]>;
  reservation$: Observable<Partial<Reservation>>;
  title = 'Choose TV';

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.tvs$ = this.store.select(getReservationTvs);
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
  }

  onTvClick(tv: TV) {
    this.store.dispatch(new fromReservation.SetTv(tv));
    this.router.navigate(['../confirmation'], { relativeTo: this.route });
  }
}
