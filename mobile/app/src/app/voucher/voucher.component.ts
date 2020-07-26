import { ModalController, IonInput, ToastController, AlertController } from "@ionic/angular";
import { Store } from "@ngrx/store";
import * as fromStore from "../state/app.reducer";
import {redeem, redeemSuccess, redeemFailure} from '../state/voucher/voucher.actions';
import { getLoading } from "src/app/state/voucher";
import { Component, ViewChild } from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: "app-voucher",
  templateUrl: "./voucher.component.html",
  styleUrls: ["./voucher.component.scss"],
})
export class VoucherComponent {
  @ViewChild("codeInput") codeInput: IonInput;
  code: string;
  isLoading$: Observable<boolean>;
  // onError$: Observable<string>;
  destroyed$ = new Subject<boolean>();

  constructor(
    public modalController: ModalController,
    private store: Store<fromStore.AppState>,
    public toastController: ToastController,  
    public alertController: AlertController,  
    private updates$: Actions
  ) {
    this.isLoading$ = this.store.select(getLoading);
    updates$.pipe(ofType(redeemFailure), takeUntil(this.destroyed$), tap(async () => {
      const toastInvalid = await this.toastController.create({
        message:
          "Sorry, that code is not valid.",
        color: "danger",
        duration: 5000,
        cssClass: "ion-text-center",
      });
      toastInvalid.present();
      }))
      .pipe(ofType(redeemSuccess), takeUntil(this.destroyed$), tap(async (response) => {
        console.log({response});
        const alert = await this.alertController.create({
          header: "response",
          message: "response",
          // subTitle: '10% of battery remaining',
          buttons: ['Dismiss']
        });
        alert.present();
    }))
    .subscribe();
  }

  async ngOnInit() {
    setTimeout(() => this.codeInput && this.codeInput.setFocus(), 1000);
    // this.onError$.pipe(filter(e => !!e)).subscribe(async (error: string) => {
    //   console.log({error});
    //   const toastInvalid = await this.toastController.create({
    //     message:
    //       "Sorry, that code is not valid.",
    //     color: "danger",
    //     duration: 5000,
    //     cssClass: "ion-text-center",
    //   });
    //   toastInvalid.present();
    // })
  }

  onCloseClick() {
    this.modalController.dismiss();
  }

  async onCodeSubmit() {
    console.log(this.code);
    this.store.dispatch(redeem({code: this.code}));
    // redeemFailure.
  }
}  