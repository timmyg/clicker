import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { Observable } from 'rxjs';
import { getUserReferralCode, isReferred, getLoading } from '../state/user';
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
  isLoading$: Observable<boolean>;
  invitedByCode: string;

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
    private actions$: Actions,
    private toastController: ToastController,
  ) {
    this.referralCode$ = this.store.select(getUserReferralCode);
    this.referred$ = this.store.select(isReferred);
    this.isLoading$ = this.store.select(getLoading);
  }

  ngOnInit() {}

  onCloseClick() {
    this.modalController.dismiss();
  }

  onInviteCode() {
    this.store.dispatch(new fromUser.AddReferral(this.invitedByCode));
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
          color: 'success',
        });
        success.present();
        this.modalController.dismiss();
      });
    this.actions$
      .pipe(
        ofType(fromUser.ADD_REFERRAL_FAIL),
        take(1),
      )
      .subscribe(async (result: any) => {
        console.log(result);
        let message = 'Something went wrong. Please try again.';
        if (result.payload.error.code === 'code.invalid') {
          message = 'Invalid code. Please try again.';
        } else if (result.payload.error.code === 'user.same') {
          message = 'You cannot redeem your own invite code. 👀';
        }
        const whoops = await this.toastController.create({
          message,
          color: 'danger',
          duration: 4000,
          cssClass: 'ion-text-center',
        });
        whoops.present();
      });
  }
}
