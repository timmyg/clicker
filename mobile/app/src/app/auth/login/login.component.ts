import { Component, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import auth0 from 'auth0-js';
const auth = new auth0.WebAuth({
  domain: 'clikr.auth0.com',
  clientID: 'w0ovjOfDoC8PoYGdf6pXTNJEQHqKLDEc',
  redirectUri: `${window.location.origin}/tabs/profile`,
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

  async onNext() {
    console.log(`+1${this.phone}`);
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
            message: `Invalid phone number.`,
            color: 'danger',
            duration: 2000,
            cssClass: 'ion-text-center',
          });
          toastInvalid.present();
          this.waiting = false;
          return console.error(err);
        }
        console.log(res);
        this.codeSent = true;
        this.waiting = false;
        const toast = await this.toastController.create({
          message: `We sent you a text. Please input code above.`,
          duration: 4000,
          cssClass: 'ion-text-center',
        });
        toast.present();
      },
    );
  }

  onLogin() {
    console.log(`+1${this.phone}`, this.code);
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
            message: `Invalid code.`,
            color: 'danger',
            duration: 2000,
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
