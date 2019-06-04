import { Component } from '@angular/core';
import { Reservation } from '../state/reservation/reservation.model';
import { Observable, forkJoin, zip } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getAllReservations, getLoading as getReservationLoading } from '../state/reservation';
import { getUser, getUserTokenCount, getLoading as getWalletLoading } from '../state/user';
import { ModalController, AlertController, ToastController, Platform, ActionSheetController } from '@ionic/angular';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';
import { Storage } from '@ionic/storage';
import { WalletPage } from './wallet/wallet.page';
import * as fromReservation from '../state/reservation/reservation.actions';
import * as fromUser from '../state/user/user.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../state/user/user.model';
import * as moment from 'moment';
import { Intercom } from 'ng-intercom';
import { LoginComponent } from '../auth/login/login.component';
import { UserService } from '../core/services/user.service';
import { environment } from 'src/environments/environment.production';
import { take } from 'rxjs/operators';
import { ofType, Actions } from '@ngrx/effects';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  reservations$: Observable<Reservation[]>;
  user$: Observable<User>;
  tokenCount$: Observable<number>;
  isReservationsLoading$: Observable<boolean>;
  isWalletLoading$: Observable<boolean>;
  faCopyright = faCopyright;
  walletModal;
  loginModal;

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
  ) {
    this.reservations$ = this.store.select(getAllReservations);
    this.user$ = this.store.select(getUser);
    this.tokenCount$ = this.store.select(getUserTokenCount);
    this.isReservationsLoading$ = this.store.select(getReservationLoading);
    this.isWalletLoading$ = this.store.select(getWalletLoading);
  }

  ngOnInit() {
    this.store.dispatch(new fromReservation.GetAll());
    this.platform.backButton.subscribe(() => {
      // might just work with android
      if (this.loginModal) this.loginModal.close();
      if (this.walletModal) this.walletModal.close();
    });
  }

  async login() {
    this.loginModal = await this.modalController.create({
      component: LoginComponent,
    });
    return await this.loginModal.present();
  }

  async openWallet() {
    this.walletModal = await this.modalController.create({
      component: WalletPage,
    });
    return await this.walletModal.present();
  }

  async openFeedback() {
    this.intercom.boot({ app_id: environment.intercom.appId });
    this.intercom.showNewMessage();
    this.intercom.onHide(() => {
      this.intercom.shutdown();
    });
  }

  onModify(reservation: Reservation) {
    console.log('reservation');
    if (reservation.minutes > 0) {
      const endTime = moment(reservation.end);
      const duration = moment.duration(endTime.diff(moment())).asMilliseconds();
      if (duration > 0) {
        this.showModify(reservation);
      } else {
        this.showToast('Sorry, your reservation has expired');
      }
    } else {
      this.showToast('Sorry, you did not reserve this TV for a time period');
    }
  }

  async showToast(message) {
    const toastInvalid = await this.toastController.create({
      message: message,
      duration: 2000,
      cssClass: 'ion-text-center',
    });
    toastInvalid.present();
  }

  createNewReservation() {
    this.store.dispatch(new fromReservation.Start());
    this.router.navigate(['/tabs/reserve/locations'], { relativeTo: this.route });
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
        'You will not be refunded any tokens, but you will be freeing up a TV for other patrons, which is appreciated ✌️',
      buttons: [
        {
          text: 'Cancel Reservation',
          role: 'destructive',
          cssClass: 'secondary',
          handler: () => {
            this.store.dispatch(new fromReservation.Cancel(reservation));
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
}
