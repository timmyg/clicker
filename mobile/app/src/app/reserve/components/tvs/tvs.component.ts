import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TV } from 'src/app/state/tv/tv.model';
import { Observable } from 'rxjs';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Store } from '@ngrx/store';
import { ReserveService } from '../../reserve.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as fromStore from '../../../state/app.reducer';
import * as fromTv from '../../../state/tv/tv.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { getReservation } from 'src/app/state/reservation';
import { getAllTvs } from 'src/app/state/tv';

@Component({
  selector: 'app-tvs',
  templateUrl: './tvs.component.html',
  styleUrls: ['./tvs.component.scss'],
})
export class TvsComponent implements OnInit {
  tvs$: Observable<TV[]>;
  reservation$: Observable<Partial<Reservation>>;
  title = 'Choose TV';

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.tvs$ = this.store.select(getAllTvs);
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
  }

  ngOnInit() {
    this.reservation$.subscribe(r => {
      this.store.dispatch(new fromTv.GetAllByLocation(r.location));
    });
  }

  onTvClick(tv: TV) {
    this.store.dispatch(new fromReservation.SetTv(tv));
    this.router.navigate(['../confirmation'], { relativeTo: this.route });
  }
}
