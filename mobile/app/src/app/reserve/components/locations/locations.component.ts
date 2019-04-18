import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from 'src/app/state/location/location.model';
import { ReserveService } from '../../reserve.service';
import { Observable } from 'rxjs';
import { getAllLocations } from 'src/app/state/location';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../state/app.reducer';
import * as fromLocation from '../../../state/location/location.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
@Component({
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  locations$: Observable<Location[]>;
  title = 'Choose Location';

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute, // private navCtrl: NavController,
    private navCtrl: NavController,
  ) {
    this.locations$ = this.store.select(getAllLocations);
    this.reserveService.emitTitle(this.title);
  }

  async ngOnInit() {
    this.store.dispatch(new fromLocation.GetAll());
    // TODO should be a better way to get reservation
    const state = await this.store.pipe(first()).toPromise();
    const reservation: Partial<Reservation> = state.reservation.reservation;
    // check if editing existing reservation
    if (reservation && reservation.id) {
      // is editing
      if (!reservation.program) {
        console.log('go to program');
        this.navCtrl.navigateForward(['../programs'], {
          relativeTo: this.route,
          queryParamsHandling: 'merge',
          // skipLocationChange: true,
        });
      } else {
        this.navCtrl.navigateForward(['../confirmation'], {
          relativeTo: this.route,
          queryParamsHandling: 'merge',
          // skipLocationChange: true,
        });
      }
    } else {
      this.store.dispatch(new fromReservation.Start());
    }
  }

  onLocationClick(location: Location) {
    this.store.dispatch(new fromReservation.SetLocation(location));
    this.router.navigate(['../programs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    // this.navCtrl.navigateForward(['../programs'], { relativeTo: this.route });
  }
}
