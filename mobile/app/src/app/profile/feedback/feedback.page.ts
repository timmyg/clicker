import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import * as fromStore from '../../state/app.reducer';
import * as fromFeedback from '../../state/feedback/feedback.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage {
  text: string;

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
    public toastController: ToastController,
  ) {}

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Thanks for your feedback!',
      duration: 2000,
    });
    toast.present();
  }

  onCloseClick() {
    this.modalController.dismiss();
  }

  onChange(e) {
    this.text = e.detail.value;
  }

  submit() {
    this.store.dispatch(new fromFeedback.Submit(this.text));
    this.modalController.dismiss();
    this.presentToast();
  }
}
