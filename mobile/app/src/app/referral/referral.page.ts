import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { Observable } from 'rxjs';
import { getUserReferralCode } from '../state/user';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.page.html',
  styleUrls: ['./referral.page.scss'],
})
export class ReferralPage implements OnInit {
  referralCode$: Observable<string>;

  constructor(private store: Store<fromStore.AppState>, public modalController: ModalController) {
    this.referralCode$ = this.store.select(getUserReferralCode);
  }

  ngOnInit() {}

  onCloseClick() {
    this.modalController.dismiss();
  }
}
