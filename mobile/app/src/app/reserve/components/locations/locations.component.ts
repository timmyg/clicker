import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from 'src/app/state/location/location.model';
import { ReserveService } from '../../reserve.service';
import { Observable, Subscription } from 'rxjs';
import { getAllLocations, getLoading, getLocationsState } from 'src/app/state/location';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../state/app.reducer';
import * as fromLocation from '../../../state/location/location.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { ofType, Actions } from '@ngrx/effects';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnDestroy, OnInit {
  locations$: Observable<Location[]>;
  title = 'Choose Location';
  isLoading$: Observable<boolean>;
  refreshSubscription: Subscription;

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute, // private navCtrl: NavController,
    private navCtrl: NavController,
    private actions$: Actions,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
  ) {
    this.locations$ = this.store.select(getAllLocations);
    this.reserveService.emitTitle(this.title);
    this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(() => this.refresh());
  }

  async ngOnInit() {
    this.isLoading$ = this.store.select(getLoading);
    this.store.dispatch(new fromLocation.GetAll());
    // TODO should be a better way to get reservation
    const state = await this.store.pipe(first()).toPromise();
    const reservation: Partial<Reservation> = state.reservation.reservation;
    this.getUserLocation();
    // check if editing existing reservation
    if (reservation && reservation.id) {
      // is editing
      if (!reservation.program) {
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

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
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

  onLocationClick(location: Location) {
    this.store.dispatch(new fromReservation.SetLocation(location));
    this.router.navigate(['../programs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    // this.navCtrl.navigateForward(['../programs'], { relativeTo: this.route });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
  }

  private async getUserLocation() {
    const x = this.diagnostic.isLocationAvailable();
    console.log(x);
    //   let options = {
    //     enableHighAccuracy: true,
    //     timeout: 25000,
    //   };
    //   this.geolocation
    //     .getCurrentPosition(options)
    //     .then(resp => {
    //       // resp.coords.latitude
    //       // resp.coords.longitude
    //     })
    //     .catch(error => {
    //       console.log('Error getting location', error);
    //     });
  }
}
