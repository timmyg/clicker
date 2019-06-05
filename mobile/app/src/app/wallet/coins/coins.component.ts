import { Component, OnInit } from '@angular/core';
import { WalletPage } from '../wallet.page';
import { Observable } from 'rxjs';
import { ModalController, ToastController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import * as fromStore from '../../state/app.reducer';
import { getUserRoles } from 'src/app/state/user';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.scss'],
})
export class CoinsComponent implements OnInit {
  tokenCount$: Observable<number>;
  userRoles$: Observable<string[]>;
  userRoles: string[];
  walletModal;

  constructor(
    private store: Store<fromStore.AppState>,
    private walletPage: WalletPage,
    public modalController: ModalController,
    public toastController: ToastController,
  ) {
    this.tokenCount$ = this.walletPage.getCoinCount();
    this.userRoles$ = this.store.select(getUserRoles);
    this.userRoles$.subscribe(userRoles => {
      this.userRoles = userRoles;
    });
  }

  ngOnInit() {}

  async onClick() {
    console.log('onclick', this.userRoles);
    if (this.userRoles && (this.userRoles.includes('money') || this.userRoles.includes('superman'))) {
      this.walletModal = await this.modalController.create({
        component: WalletPage,
      });
      return await this.walletModal.present();
    } else {
      const toast = await this.toastController.create({
        message: `Adding tokens is not available.`,
        duration: 2000,
        cssClass: 'ion-text-center',
      });
      toast.present();
    }
  }
}
