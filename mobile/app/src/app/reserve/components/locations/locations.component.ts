import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from 'src/app/state/location/location.model';
import { ReserveService } from '../../reserve.service';
import { Observable, Subscription, Subject, BehaviorSubject } from 'rxjs';
import { getAllLocations, getLoading, getLocationsState } from 'src/app/state/location';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../state/app.reducer';
import * as fromLocation from '../../../state/location/location.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { ofType, Actions } from '@ngrx/effects';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Storage } from '@ionic/storage';
const permissionGeolocation = {
  name: 'permission.geolocation',
  values: {
    allowed: 'allowed',
    probably: 'probably',
    denied: 'denied',
  },
};

@Component({
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnDestroy, OnInit {
  locations$: Observable<Location[]>;
  title = 'Choose Location';
  isLoading$: Observable<boolean>;
  refreshSubscription: Subscription;
  askForGeolocation$ = new BehaviorSubject<boolean>(true);
  evaluatingGeolocation = true;

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute, // private navCtrl: NavController,
    private navCtrl: NavController,
    private actions$: Actions,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private platform: Platform,
    private storage: Storage,
  ) {
    this.locations$ = this.store.select(getAllLocations);
    this.reserveService.emitTitle(this.title);
    this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(() => this.refresh());
  }

  async ngOnInit() {
    this.redirectIfUpdating();
    this.evaluateGeolocation();
    this.isLoading$ = this.store.select(getLoading);
  }

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
  }

  private async redirectIfUpdating() {
    // TODO should be a better way to get reservation
    const state = await this.store.pipe(first()).toPromise();
    const reservation: Partial<Reservation> = state.reservation.reservation;
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

  async allowLocation() {
    console.log('setting cookie', permissionGeolocation.name, permissionGeolocation.values.probably);
    await this.storage.set(permissionGeolocation.name, permissionGeolocation.values.probably);
    this.evaluateGeolocation();
  }

  async denyLocation() {
    await this.storage.set(permissionGeolocation.name, permissionGeolocation.values.denied);
    // this.askForGeolocation$ = false;
    this.askForGeolocation$.next(false);
    // TODO load all locations
  }

  private async evaluateGeolocation() {
    // check if have location permission
    // if have location permission, get coords and send to backend with getlocation
    // if no permission, set a flag and show a explainer + button in ui

    if (this.platform.is('cordova')) {
      // TODO
      const x = this.diagnostic.isLocationAvailable();
      console.log(x);
    } else {
      // web
      const permissionStatus = await this.storage.get(permissionGeolocation.name);
      console.log({ permissionStatus });
      if (
        permissionStatus &&
        (permissionStatus === permissionGeolocation.values.allowed || permissionGeolocation.values.probably)
      ) {
        //   let options = {
        //     enableHighAccuracy: true,
        //     timeout: 25000,
        //   };
        await this.geolocation
          .getCurrentPosition()
          .then(response => {
            this.askForGeolocation$.next(false);
            this.evaluatingGeolocation = false;
            this.storage.set(permissionGeolocation.name, permissionGeolocation.values.allowed);
            console.log(response);
            console.log(this.askForGeolocation$);
            const { latitude, longitude } = response.coords;
            this.store.dispatch(new fromLocation.GetAll({ latitude, longitude }));
            // resp.coords.latitude
            // resp.coords.longitude
          })
          .catch(error => {
            console.log('Error getting location', error);
          });
      } else {
        // no permission
        // this.noGeolocationPermission = true;
        this.evaluatingGeolocation = false;
        this.store.dispatch(new fromLocation.GetAll());
      }
    }
  }
}
