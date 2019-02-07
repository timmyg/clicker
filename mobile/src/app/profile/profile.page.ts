import { Component, OnInit } from '@angular/core';
import { Reservation } from '../state/reservation/reservation.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getAllReservations } from '../state/reservation';
import { ModalController } from '@ionic/angular';
import { WalletPage } from '../shared/wallet/wallet.page';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  reservations$: Observable<Reservation[]>;

  constructor(private store: Store<fromStore.AppState>, public modalController: ModalController) {
    this.reservations$ = this.store.select(getAllReservations);
  }

  async openWallet() {
    const modal = await this.modalController.create({
      component: WalletPage,
      componentProps: { value: 123 },
    });
    return await modal.present();
  }

  ngOnInit() {}
}
