import { Component } from '@angular/core';
import { Reservation } from '../state/reservation/reservation.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getAllReservations, getLoading } from '../state/reservation';
import { getUser, getUserTokenCount } from '../state/user';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';
import { Storage } from '@ionic/storage';
import { WalletPage } from './wallet/wallet.page';
import * as fromReservation from '../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../state/user/user.model';
import * as moment from 'moment';
import { Intercom } from 'ng-intercom';
import { LoginComponent } from '../auth/login/login.component';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  reservations$: Observable<Reservation[]>;
  user$: Observable<User>;
  tokenCount$: Observable<number>;
  // user: User;
  isReservationsLoading$: Observable<boolean>;
  faCopyright = faCopyright;
  walletModal;
  feedbackModal;
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
  ) {
    this.reservations$ = this.store.select(getAllReservations);
    this.user$ = this.store.select(getUser);
    this.tokenCount$ = this.store.select(getUserTokenCount);
    this.isReservationsLoading$ = this.store.select(getLoading);
  }

  ngOnInit() {
    this.store.dispatch(new fromReservation.GetAll());
  }

  async login() {
    this.loginModal = await this.modalController.create({
      component: LoginComponent,
      // componentProps: { monies: this.user.tokens },
    });
    return await this.loginModal.present();
  }

  async openWallet() {
    this.walletModal = await this.modalController.create({
      component: WalletPage,
      // componentProps: { monies: this.user.tokens },
    });
    return await this.walletModal.present();
  }

  async openFeedback() {
    // this.feedbackModal = await this.modalController.create({
    //   component: FeedbackPage,
    // });
    // return await this.feedbackModal.present();
    this.intercom.boot({ app_id: 'lp9l5d9l' });
    this.intercom.showNewMessage();
    this.intercom.onHide(() => {
      console.log('hide!');
      this.intercom.shutdown();
    });
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
            // await this.storage.clear();
            // await this.storage.remove(items[i].id);
            await this.storage.set('token', originalToken);
            return location.reload();
          },
        },
      ],
    });

    await alert.present();
  }
}
