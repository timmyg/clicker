import { Component, OnInit } from '@angular/core';
import { WalletPage } from '../wallet.page';
import { Observable } from 'rxjs';
import { ModalController, ToastController, Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import * as fromStore from '../../state/app.reducer';
import { getUserRoles, isLoggedIn } from 'src/app/state/user';
import { LoginComponent } from 'src/app/auth/login/login.component';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.scss'],
})
export class CoinsComponent implements OnInit {
  tokenCount$: Observable<number>;
  userRoles$: Observable<string[]>;
  isLoggedIn$: Observable<boolean>;
  isLoggedIn: boolean;
  userRoles: string[];
  walletModal;
  loginModal;

  constructor(
    private store: Store<fromStore.AppState>,
    private walletPage: WalletPage,
    public modalController: ModalController,
    public toastController: ToastController,
    private platform: Platform,
  ) {
    this.tokenCount$ = this.walletPage.getCoinCount();
    this.userRoles$ = this.store.select(getUserRoles);
    this.userRoles$.subscribe(userRoles => {
      this.userRoles = userRoles;
    });
    this.isLoggedIn$ = this.store.select(isLoggedIn);
    this.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  ngOnInit() {
    this.platform.backButton.subscribe(() => {
      // might just work with android
      if (this.loginModal) this.loginModal.close();
      if (this.walletModal) this.walletModal.close();
    });
  }

  async onClick() {
    // if (this.userRoles && (this.userRoles.includes('money') || this.userRoles.includes('superman'))) {
    if (this.isLoggedIn) {
      this.walletModal = await this.modalController.create({
        component: WalletPage,
      });
      return await this.walletModal.present();
    } else {
      const toast = await this.toastController.create({
        message: `You must be logged in to buy tokens.`,
        duration: 4000,
        buttons: [
          {
            side: 'end',
            text: 'Login',
            handler: async () => {
              this.loginModal = await this.modalController.create({
                component: LoginComponent,
              });
              return await this.loginModal.present();
            },
          },
        ],
      });
      toast.present();
    }
  }
}
