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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  reservations$: Observable<Reservation[]>;
  faCopyright = faCopyright;
  walletModal;

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
    private storage: Storage,
  ) {
    this.reservations$ = this.store.select(getAllReservations);
  }

  async openWallet() {
    this.walletModal = await this.modalController.create({
      component: WalletPage,
      componentProps: { monies: 9 },
    });
    return await this.walletModal.present();
  }

  ngOnInit() {}

  onLogout() {
    this.storage.clear();
    location.reload();
  }
}
