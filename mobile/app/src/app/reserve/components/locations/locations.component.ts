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
import { NavController, ActionSheetController, ToastController } from '@ionic/angular';
import { first, take } from 'rxjs/operators';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Geolocation as Geo } from 'src/app/state/location/geolocation.model';
import { ofType, Actions } from '@ngrx/effects';
import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;
import { Storage } from '@ionic/storage';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from 'src/app/globals';

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
  userLocations$: Observable<string[]>;
  userLocations: string[];
  userRoles$: Observable<string[]>;
  userRoles: string[];
  searchTerm: string;
  refreshSubscription: Subscription;
  searchSubscription: Subscription;
  closeSearchSubscription: Subscription;
  askForGeolocation$ = new BehaviorSubject<boolean>(true);
  userGeolocation: Geo;
  evaluatingGeolocation = true;
  geolocationDeclined = true;
  waiting: boolean;

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
  ) {
    this.locations$ = this.store.select(getAllLocations);
    this.reserveService.emitTitle(this.title);
    this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(() => this.refresh());
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
    });
    this.closeSearchSubscription = this.reserveService.closeSearchEmitted$.subscribe(() => {
      this.searchTerm = null;
    });
  }

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.closeSearchSubscription.unsubscribe();
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
      this.segment.track(this.globals.events.reservation.started);
    }
  }

  refresh() {
    this.store.dispatch(new fromLocation.GetAll(this.userGeolocation));
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
  }

  async allowLocation() {
    await this.storage.set(permissionGeolocation.name, permissionGeolocation.values.probably);
    this.evaluateGeolocation();
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
      await Geolocation.getCurrentPosition()
        .then(response => {
          this.askForGeolocation$.next(false);
          this.evaluatingGeolocation = false;
          this.geolocationDeclined = false;
          this.storage.set(permissionGeolocation.name, permissionGeolocation.values.allowed);
          const { latitude, longitude } = response.coords;
          this.userGeolocation = { latitude, longitude };
          this.store.dispatch(new fromLocation.GetAll(this.userGeolocation));
          this.reserveService.emitShowingLocations();
        })
        .catch(async error => {
          this.evaluatingGeolocation = false;
          this.askForGeolocation$.next(false);
          this.store.dispatch(new fromLocation.GetAll(this.userGeolocation));
          this.reserveService.emitShowingLocations();
          console.error('Error getting location', error);
          const whoops = await this.toastController.create({
            message: 'You need to allow location services in your phone settings for this app.',
            color: 'light',
            duration: 6000,
            cssClass: 'ion-text-center',
          });
          whoops.present();
        });
    } else if (permissionStatus === permissionGeolocation.values.denied) {
      this.askForGeolocation$.next(false);
      this.evaluatingGeolocation = false;
      this.reserveService.emitShowingLocations();
      this.store.dispatch(new fromLocation.GetAll());
    } else {
      this.askForGeolocation$.next(true);
      this.evaluatingGeolocation = false;
    }
  }

  async forceAllow() {
    await this.storage.remove(permissionGeolocation.name);
    location.reload();
  }

  onLocationClick(location: Location) {
    this.waiting = true;
    this.reserveService.emitCloseSearch();
    this.store.dispatch(new fromReservation.SetLocation(location));
    this.actions$
      .pipe(ofType(fromReservation.SET_RESERVATION_LOCATION_SUCCESS))
      .pipe(first())
      .subscribe(async () => {
        this.router.navigate(['../programs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
      });
  }
}
