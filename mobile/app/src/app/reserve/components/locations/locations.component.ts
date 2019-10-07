import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from 'src/app/state/location/location.model';
import { ReserveService } from '../../reserve.service';
import { Observable, Subscription, BehaviorSubject, forkJoin } from 'rxjs';
import { getAllLocations, getLoading } from 'src/app/state/location';
import { getUserLocations, getUserRoles } from 'src/app/state/user';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../state/app.reducer';
import * as fromLocation from '../../../state/location/location.actions';
import * as fromUser from '../../../state/user/user.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ActionSheetController, ToastController, Platform } from '@ionic/angular';
import { first, take } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Geolocation as Geo } from 'src/app/state/location/geolocation.model';
import { ofType, Actions } from '@ngrx/effects';
import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;
import { Storage } from '@ionic/storage';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from 'src/app/globals';
import { Intercom } from 'ng-intercom';
import { GeolocationOptions } from '@ionic-native/geolocation/ngx';

const permissionGeolocation = {
  name: 'permission.geolocation',
  values: {
    allowed: 'allowed',
    probably: 'probably',
    denied: 'denied',
  },
};

// not working in browser
const geolocationOptions: GeolocationOptions = {
  // enableHighAccuracy: true,
  // timeout: 10000, // 10 seconds
  // maximumAge: 600000, // 10 minutes
};

@Component({
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnDestroy, OnInit {
  locations$: Observable<Location[]>;
  title = 'Choose Location';
  isLoading$: Observable<boolean>;
  userLocations$: Observable<string[]>;
  userLocations: string[];
  userRoles$: Observable<string[]>;
  userRoles: string[];
  searchTerm: string;
  refreshSubscription: Subscription;
  searchSubscription: Subscription;
  closeSearchSubscription: Subscription;
  hiddenLocationsSubscription: Subscription;
  askForGeolocation$ = new BehaviorSubject<boolean>(true);
  userGeolocation: Geo;
  evaluatingGeolocation = true;
  geolocationDeclined = true;
  waiting: boolean;
  showHidden = false;
  disableButton = false;
  sub: Subscription;
  milesRadius = 100;

  constructor(
    private store: Store<fromStore.AppState>,
    public actionSheetController: ActionSheetController,
    public toastController: ToastController,
    public reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private actions$: Actions,
    private storage: Storage,
    private segment: SegmentService,
    private globals: Globals,
    public intercom: Intercom,
    public platform: Platform,
  ) {
    this.locations$ = this.store.select(getAllLocations);
    this.reserveService.emitTitle(this.title);
    this.reserveService.emitTitle(this.title);
    this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(() => this.refresh());
    this.hiddenLocationsSubscription = this.reserveService.showingHiddenLocationsEmitted$.subscribe(() => {
      this.showHidden = !this.showHidden;
      if (this.showHidden) {
        this.store.dispatch(new fromLocation.GetAll(this.userGeolocation));
      } else {
        this.refresh();
      }
    });
  }

  async ngOnInit() {
    this.redirectIfUpdating();
    this.evaluateGeolocation();
    this.isLoading$ = this.store.select(getLoading);
    this.userLocations$ = this.store.select(getUserLocations);
    this.userLocations$.pipe().subscribe(userLocations => {
      this.userLocations = userLocations;
    });
    this.userRoles$ = this.store.select(getUserRoles);
    this.userRoles$.pipe().subscribe(userRoles => {
      this.userRoles = userRoles;
    });
    this.searchSubscription = this.reserveService.searchTermEmitted$.subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.segment.track(this.globals.events.location.search, { term: this.searchTerm });
    });
    this.closeSearchSubscription = this.reserveService.closeSearchEmitted$.subscribe(() => {
      this.searchTerm = null;
    });
  }

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.closeSearchSubscription.unsubscribe();
    if (this.sub) this.sub.unsubscribe();
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
        });
      } else {
        this.navCtrl.navigateForward(['../confirmation'], {
          relativeTo: this.route,
          queryParamsHandling: 'merge',
        });
      }
    } else {
      this.store.dispatch(new fromReservation.Start());
      // this.segment.track(this.globals.events.reservation.started);
    }
  }

  async refresh() {
    console.time('geolocation 1');
    await Geolocation.getCurrentPosition(geolocationOptions).then(response => {
      console.timeEnd('geolocation 1');
      const { latitude, longitude } = response.coords;
      this.userGeolocation = { latitude, longitude };
      this.store.dispatch(new fromLocation.GetAll(this.userGeolocation, this.milesRadius));
      this.store.dispatch(new fromUser.Refresh());
      this.actions$
        .pipe(
          ofType(fromLocation.GET_ALL_LOCATIONS_SUCCESS),
          take(1),
        )
        .subscribe(() => {
          this.reserveService.emitRefreshed();
        });
      this.actions$
        .pipe(ofType(fromLocation.GET_ALL_LOCATIONS_FAIL))
        .pipe(first())
        .subscribe(async () => {
          const whoops = await this.toastController.create({
            message: 'Something went wrong. Please try again.',
            color: 'danger',
            duration: 4000,
            cssClass: 'ion-text-center',
          });
          whoops.present();
          this.reserveService.emitRefreshed();
        });
    });
  }

  async suggestLocation() {
    // await this.intercom.boot({ app_id: environment.intercom.appId });
    await this.intercom.showNewMessage();
    this.intercom.onHide(() => {
      this.intercom.update({ hide_default_launcher: true });
    });
    this.sub = this.platform.backButton.pipe(first()).subscribe(() => {
      this.intercom.hide();
    });
  }

  async allowLocation() {
    await this.storage.set(permissionGeolocation.name, permissionGeolocation.values.probably);
    this.evaluateGeolocation();
    this.disableButton = true;
    this.segment.track(this.globals.events.permissions.geolocation.allowed);
  }

  async denyLocation() {
    await this.storage.set(permissionGeolocation.name, permissionGeolocation.values.denied);
    this.askForGeolocation$.next(false);
    this.evaluateGeolocation();
    this.segment.track(this.globals.events.permissions.geolocation.denied);
  }

  async onLocationManage(location: Location) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Manage Location',
      buttons: [
        {
          text: 'Turn off all TVs',
          icon: 'power',
          cssClass: 'color-danger',
          handler: () => {
            this.store.dispatch(new fromLocation.TurnOff(location));
          },
        },
        {
          text: 'Turn on all TVs',
          icon: 'power',
          cssClass: 'color-success',
          handler: () => {
            this.store.dispatch(new fromLocation.TurnOn(location));
          },
        },
        {
          text: 'Turn on all TVs + autotune',
          icon: 'power',
          cssClass: 'color-success',
          handler: () => {
            this.store.dispatch(new fromLocation.TurnOn(location, true));
          },
        },
      ],
    });
    await actionSheet.present();
  }

  private async evaluateGeolocation() {
    const permissionStatus = await this.storage.get(permissionGeolocation.name);
    if (
      permissionStatus &&
      (permissionStatus === permissionGeolocation.values.allowed ||
        permissionStatus === permissionGeolocation.values.probably)
    ) {
      await Geolocation.getCurrentPosition(geolocationOptions)
        .then(response => {
          const { latitude, longitude } = response.coords;
          console.log(latitude, longitude);
          this.store.dispatch(new fromUser.SetGeolocation(latitude, longitude));
          this.askForGeolocation$.next(false);
          this.evaluatingGeolocation = false;
          this.geolocationDeclined = false;
          this.disableButton = false;
          this.storage.set(permissionGeolocation.name, permissionGeolocation.values.allowed);
          this.userGeolocation = { latitude, longitude };
          this.store.dispatch(new fromLocation.GetAll(this.userGeolocation, this.milesRadius));
          this.reserveService.emitShowingLocations();
        })
        .catch(async error => {
          this.evaluatingGeolocation = false;
          this.askForGeolocation$.next(false);
          this.store.dispatch(new fromLocation.GetAll(this.userGeolocation, this.milesRadius));
          this.reserveService.emitShowingLocations();
          this.disableButton = false;
          console.error('Error getting location', error);
          const whoops = await this.toastController.create({
            message: 'Error getting your location. Make sure location services are enabled for this app.',
            color: 'light',
            duration: 6000,
            cssClass: 'ion-text-center',
          });
          whoops.present();
        });
    } else {
      this.askForGeolocation$.next(true);
      this.evaluatingGeolocation = false;
      this.disableButton = false;
    }
  }

  async forceAllow() {
    await this.storage.remove(permissionGeolocation.name);
    location.reload();
  }

  onLocationClick(location: Location) {
    this.waiting = true;
    this.reserveService.emitCloseSearch();
    console.log(location);
    const { latitude, longitude } = this.userGeolocation;
    this.store.dispatch(new fromReservation.SetLocation(location, latitude, longitude));
    this.actions$
      .pipe(ofType(fromReservation.SET_RESERVATION_LOCATION_SUCCESS))
      .pipe(first())
      .subscribe(async () => {
        await this.segment.track(this.globals.events.reservation.selectedLocation, location);
        this.router.navigate(['../programs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
      });
  }

  // toggleHiddenLocations() {}
}
