import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import auth0 from 'auth0-js';
import { environment } from 'src/environments/environment';
const auth = new auth0.WebAuth({
  domain: environment.auth0.domain,
  clientID: environment.auth0.clientId,
  redirectUri: `${window.location.origin}/tabs/profile/logging-in`,
  responseType: 'token id_token',
});

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // @ViewChild('phoneElem') phoneElem;
  phone: string;
  code: string;
  codeSent: boolean;
  waiting: boolean;

  constructor(public modalController: ModalController, public toastController: ToastController) {}

  // ngAfterViewChecked() {
  //   this.phoneElem.setFocus();
  // }

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
          return console.error(err);
        }
        this.codeSent = true;
        this.waiting = false;
      },
    );
  }

  getPhoneNumberErrorMessage(errCode: string) {
    switch (errCode) {
      case 'sms_provider_error':
    }
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
          return console.error(err);
        }
        this.waiting = false;
      },
    );
  }

  isEligibleCode() {
    return this.code && this.code.toString().length >= 4;
  }
}
