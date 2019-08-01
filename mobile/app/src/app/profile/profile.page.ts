import { Component } from '@angular/core';
import { Reservation } from '../state/reservation/reservation.model';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getAllReservations, getLoading as getReservationLoading } from '../state/reservation';
import { getUser, getLoading as getWalletLoading } from '../state/user';
import { ModalController, AlertController, ToastController, Platform, ActionSheetController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as fromReservation from '../state/reservation/reservation.actions';
import * as fromUser from '../state/user/user.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../state/user/user.model';
import * as moment from 'moment';
import { Intercom } from 'ng-intercom';
import { LoginComponent } from '../auth/login/login.component';
import { UserService } from '../core/services/user.service';
import { take, first } from 'rxjs/operators';
import { ofType, Actions } from '@ngrx/effects';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from '../globals';
import { ToastOptions } from '@ionic/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  reservations$: Observable<Reservation[]>;
  user$: Observable<User>;
  isReservationsLoading$: Observable<boolean>;
  isWalletLoading$: Observable<boolean>;
  sub: Subscription;
  sub2: Subscription;
  showRatingLink = false;
  loginModal;
  rating = {
    cookieName: 'rating',
    given: 'given',
  };

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
    public alertController: AlertController,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute,
    public intercom: Intercom,
    public toastController: ToastController,
    public userService: UserService,
    private actions$: Actions,
    private platform: Platform,
    public actionSheetController: ActionSheetController,
    private segment: SegmentService,
    private globals: Globals,
  ) {
    this.reservations$ = this.store.select(getAllReservations);
    this.user$ = this.store.select(getUser);
    this.isReservationsLoading$ = this.store.select(getReservationLoading);
    this.isWalletLoading$ = this.store.select(getWalletLoading);
  }

  ngOnInit() {
    this.store.dispatch(new fromReservation.GetAll());
    this.platform.backButton.pipe(first()).subscribe(() => {
      // android
      if (this.loginModal) this.loginModal.close();
    });
    this.configureRating();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.sub2) this.sub2.unsubscribe();
  }

  async configureRating() {
    const rating = await this.storage.get(this.rating.cookieName);
    if (rating === this.rating.given) {
      this.showRatingLink = false;
    } else {
      this.showRatingLink = true;
    }
  }

  async login() {
    this.loginModal = await this.modalController.create({
      component: LoginComponent,
    });
    this.sub = this.platform.backButton.pipe(first()).subscribe(() => {
      if (this.loginModal) this.loginModal.close();
    });
    return await this.loginModal.present();
  }

  async openFeedback() {
    // await this.intercom.boot({ app_id: environment.intercom.appId });
    await this.intercom.showNewMessage();
    this.intercom.onHide(() => {
      this.intercom.update({ hide_default_launcher: true });
    });
    this.sub2 = this.platform.backButton.pipe(first()).subscribe(() => {
      this.intercom.hide();
    });
  }

  onModify(reservation: Reservation) {
    if (reservation.minutes > 0) {
      const endTime = moment(reservation.end);
      const duration = moment.duration(endTime.diff(moment())).asMilliseconds();
      if (duration > 0) {
        this.showModify(reservation);
      } else {
        this.showToast('Sorry, your reservation has expired', true);
      }
    } else {
      this.showToast('Sorry, you did not reserve this TV for a time period.', true);
    }
  }

  async showToast(message, showNewReservation = false) {
    const toastOptions: ToastOptions = {
      message: message,
      duration: 4000,
      cssClass: 'ion-text-center',
    };
    let toast;
    if (showNewReservation) {
      toastOptions.buttons = [
        {
          side: 'end',
          text: 'Reserve Now',
          handler: () => {
            this.router.navigate(['/tabs/reserve']);
            toast.dismiss();
          },
        },
      ];
    }
    toast = await this.toastController.create(toastOptions);
    toast.present();
  }

  createNewReservation(source: string) {
    this.store.dispatch(new fromReservation.Start());
    this.router.navigate(['/tabs/reserve/locations'], { relativeTo: this.route });
    if (source === 'fab') {
      this.segment.track(this.globals.events.reservation.clickedButton);
    } else if (source === 'link') {
      this.segment.track(this.globals.events.reservation.clickedLink);
    }
  }

  // this will make sure it disappears from screen if you stay on screen
  // ... definitely a better way to do this
  isActive(reservation: Reservation) {
    const remaining = moment.duration(moment(reservation.end).diff(moment())).asSeconds();
    return remaining > 0;
  }

  async showModify(reservation: Reservation) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Modify Reservation',
      buttons: [
        {
          text: 'Cancel Reservation',
          role: 'destructive',
          handler: () => {
            this.onReservationCancel(reservation);
          },
        },
        {
          text: 'Change Channel',
          handler: () => {
            const reservationToUpdate = Object.assign({}, reservation);
            delete reservationToUpdate.program;
            this.store.dispatch(new fromReservation.SetForUpdate(reservationToUpdate));
            this.router.navigate(['/tabs/reserve'], { queryParams: { edit: 'channel' }, skipLocationChange: true });
          },
        },
        {
          text: 'Add Time',
          handler: () => {
            const reservationToUpdate = Object.assign({}, reservation);
            this.store.dispatch(new fromReservation.SetForUpdate(reservationToUpdate));
            this.router.navigate(['/tabs/reserve'], { queryParams: { edit: 'time' }, skipLocationChange: true });
          },
        },
      ],
    });
    await actionSheet.present();
  }

  async onReservationCancel(reservation: Reservation) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message:
        'You will not be refunded any tokens, but you will be freeing up a TV for others, which is appreciated ✌️',
      buttons: [
        {
          text: 'Cancel Reservation',
          role: 'destructive',
          cssClass: 'secondary',
          handler: () => {
            this.store.dispatch(new fromReservation.Cancel(reservation));
            this.segment.track(this.globals.events.reservation.cancelled);
            // clearInterval(this.intervalJobId);
          },
        },
      ],
    });

    await alert.present();
  }

  doRefresh(event) {
    this.store.dispatch(new fromReservation.GetAll());
    this.store.dispatch(new fromUser.Refresh());
    // zip(
    this.actions$
      .pipe(
        ofType(fromReservation.GET_RESERVATIONS_SUCCESS),
        take(1),
      )
      .subscribe(() => {
        event.target.complete();
      });
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'Your existing reservations will not be affected',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Logout',
          role: 'destructive',
          cssClass: 'secondary',
          handler: async () => {
            const originalToken = await this.storage.get('originalToken');
            await this.storage.clear();
            // await this.storage.remove(items[i].id);
            await this.storage.set('originalToken', originalToken);
            await this.storage.set('token', originalToken);
            return location.reload();
          },
        },
      ],
    });

    await alert.present();
  }

  async rate() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Rate the Clicker TV app',
      buttons: [
        {
          text: 'I already left a rating',
          handler: async () => {
            await this.storage.set(this.rating.cookieName, this.rating.given);
            this.showRatingLink = false;
            const toast = await this.toastController.create({
              message: `We appreciate it! 🙌😁😍🎉😻🎈`,
              duration: 3000,
              cssClass: 'ion-text-center',
            });
            await toast.present();
            this.segment.track(this.globals.events.rated);
            this.segment.identify(null, { rated: true });
          },
        },
        {
          text: 'Leave rating',
          handler: async () => {
            await this.storage.set(this.rating.cookieName, this.rating.given);
            let link = 'https://tryclicker.com';
            if (this.platform.is('ios')) {
              link = 'itms-apps://itunes.apple.com/app/apple-store/id1471666907?mt=8';
            } else if (this.platform.is('android')) {
              link = 'market://details?id=com.teamclicker.app';
            }
            window.open(link);
            return null;
          },
        },
      ],
    });

    await actionSheet.present();
  }

  getStoreName() {
    let storeName = 'app store';
    if (this.platform.is('ios')) {
      storeName = 'App Store';
    } else if (this.platform.is('android')) {
      storeName = 'Play Store';
    }
    return storeName;
  }
}
