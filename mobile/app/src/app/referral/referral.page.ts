import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { Observable } from 'rxjs';
import { getUserReferralCode, isReferred } from '../state/user';
import { ModalController, ToastController } from '@ionic/angular';
import * as fromUser from '../state/user/user.actions';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.page.html',
  styleUrls: ['./referral.page.scss'],
})
export class ReferralPage implements OnInit {
  referralCode$: Observable<string>;
  referred$: Observable<boolean>;
  invitedByCode: string;

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
    private actions$: Actions,
    private toastController: ToastController,
  ) {
    this.referralCode$ = this.store.select(getUserReferralCode);
    this.referred$ = this.store.select(isReferred);
  }

  ngOnInit() {}

  onCloseClick() {
    this.modalController.dismiss();
  }
  onInviteCode() {
    this.store.dispatch(new fromUser.AddReferralSuccess(this.invitedByCode));
    this.actions$
      .pipe(
        ofType(fromUser.ADD_REFERRAL_SUCCESS),
        take(1),
      )
      .subscribe(async () => {
        const success = await this.toastController.create({
          message: 'Success! We added a token to both your accounts!',
          duration: 4000,
          cssClass: 'ion-text-center',
        });
        success.present();
      });
    this.actions$
      .pipe(
        ofType(fromUser.ADD_REFERRAL_FAIL),
        take(1),
      )
      .subscribe(async () => {
        const whoops = await this.toastController.create({
          message: 'Something went wrong. Please try again.',
          color: 'danger',
          duration: 4000,
          cssClass: 'ion-text-center',
        });
        whoops.present();
      });
  }
}
