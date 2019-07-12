import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import auth0 from 'auth0-js';
import { environment } from 'src/environments/environment';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from 'src/app/globals';
const auth = new auth0.WebAuth({
  domain: environment.auth0.domain,
  clientID: environment.auth0.clientId,
  // redirectUri: `${window.location.origin}/tabs/profile/logging-in`,
  // redirectUri: `${environment.packageId}://${environment.auth0.domain}/cordova/${
  //   environment.packageId
  // }/tabs/profile/logging-in`,
  // redirectUri: `${environment.packageId}://${environment.auth0.domain}/android/${
  //   environment.packageId
  // }/tabs/profile/logging-in`,
  redirectUri: `https://develop.tryclicker.com/app/auth`,
  responseType: 'token id_token',
  // prompt: 'none',
  packageId: environment.packageId,
});

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  phone: string;
  code: string;
  codeSent: boolean;
  waiting: boolean;

  constructor(
    public modalController: ModalController,
    public toastController: ToastController,
    private segment: SegmentService,
    private globals: Globals,
  ) {}

  onCloseClick() {
    this.modalController.dismiss();
  }

  async onPhoneSubmit() {
    this.waiting = true;
    auth.passwordlessStart(
      {
        connection: 'sms',
        send: 'code',
        phoneNumber: `+1${this.phone}`,
      },
      async (err, res) => {
        if (err) {
          const toastInvalid = await this.toastController.create({
            message: err.description,
            color: 'danger',
            duration: 4000,
            cssClass: 'ion-text-center',
          });
          toastInvalid.present();
          this.waiting = false;
          return console.error(err, JSON.stringify(window));
        }
        this.segment.track(this.globals.events.login.started);
        this.codeSent = true;
        this.waiting = false;
      },
    );
  }

  onCodeSubmit() {
    this.waiting = true;
    auth.passwordlessLogin(
      {
        connection: 'sms',
        phoneNumber: `+1${this.phone}`.trim(),
        verificationCode: this.code.toString(),
      },
      async (err, res) => {
        if (err) {
          const toastInvalid = await this.toastController.create({
            message: err.code === 'access_denied' ? 'Invalid code' : err.description,
            color: 'danger',
            duration: 4000,
            cssClass: 'ion-text-center',
          });
          toastInvalid.present();
          this.waiting = false;
          return console.error(err, JSON.stringify(window));
        }
        this.waiting = false;
      },
    );
  }

  isEligibleCode() {
    return this.code && this.code.toString().length >= 4;
  }
}
