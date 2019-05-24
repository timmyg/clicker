import { Component, OnDestroy } from '@angular/core';
import { TV } from 'src/app/state/location/tv.model';
import { Observable, Subscription } from 'rxjs';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Store } from '@ngrx/store';
import { ReserveService } from '../../reserve.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as fromStore from '../../../state/app.reducer';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { getReservation, getReservationTvs } from 'src/app/state/reservation';
import * as fromLocation from '../../../state/location/location.actions';
import { ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { Actions, ofType } from '@ngrx/effects';
import { first } from 'rxjs/operators';
import { getLoading } from 'src/app/state/location';

@Component({
  selector: 'app-tvs',
  templateUrl: './tvs.component.html',
  styleUrls: ['./tvs.component.scss'],
})
export class TvsComponent implements OnDestroy {
  tvs$: Observable<TV[]>;
  reservation$: Observable<Partial<Reservation>>;
  refreshSubscription: Subscription;
  title = 'Choose TV';
  isLoading$: Observable<boolean>;

  constructor(
    private store: Store<fromStore.AppState>,
    public reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private actions$: Actions,
  ) {
    this.tvs$ = this.store.select(getReservationTvs);
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
    this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(() => this.refresh());
  }

  ngOnInit() {
    this.isLoading$ = this.store.select(getLoading);
  }

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
  }

  async onTvClick(tv: TV) {
    if (tv.reserved) {
      const toast = await this.toastController.create({
        message: `${tv.label} is reserved until ${moment(tv.end).format('h:mma')}`,
        duration: 2000,
        cssClass: 'ion-text-center',
      });
      return toast.present();
    }
    this.store.dispatch(new fromReservation.SetTv(tv));
    this.router.navigate(['../confirmation'], { relativeTo: this.route });
  }

  refresh() {
    this.store.dispatch(new fromLocation.GetAll());
    this.actions$
      .pipe(ofType(fromLocation.GET_ALL_LOCATIONS_SUCCESS))
      .pipe(first())
      .subscribe(() => {
        this.reserveService.emitRefreshed();
      });
  }
}
