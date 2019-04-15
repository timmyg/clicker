import { Component, OnInit } from '@angular/core';
import { Reservation } from '../state/reservation/reservation.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getAllReservations } from '../state/reservation';
import { ModalController } from '@ionic/angular';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';
import { Storage } from '@ionic/storage';
import { WalletPage } from './wallet/wallet.page';
import { FeedbackPage } from './feedback/feedback.page';
import * as fromReservation from '../state/reservation/reservation.actions';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  reservations$: Observable<Reservation[]>;
  faCopyright = faCopyright;
  walletModal;
  feedbackModal;

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
    private storage: Storage,
  ) {
    this.reservations$ = this.store.select(getAllReservations);
  }

  ngOnInit() {
    this.store.dispatch(new fromReservation.GetAll());
  }

  async openWallet() {
    this.walletModal = await this.modalController.create({
      component: WalletPage,
      componentProps: { monies: 9 },
    });
    return await this.walletModal.present();
  }

  async openFeedback() {
    this.feedbackModal = await this.modalController.create({
      component: FeedbackPage,
    });
    return await this.feedbackModal.present();
  }

  onLogout() {
    this.storage.clear();
    location.reload();
  }
}
