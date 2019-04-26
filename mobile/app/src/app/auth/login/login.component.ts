import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import auth0 from 'auth0-js';
const auth = new auth0.WebAuth({
  domain: 'clikr.auth0.com',
  clientID: 'w0ovjOfDoC8PoYGdf6pXTNJEQHqKLDEc',
  redirectUri: 'http://local.tryclicker.com:4100/tabs/profile',
  responseType: 'token id_token',
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

  constructor(public modalController: ModalController) {}

  onCloseClick() {
    this.modalController.dismiss();
  }

  onNext() {
    console.log(`+1${this.phone}`);
    auth.passwordlessStart(
      {
        connection: 'sms',
        send: 'code',
        phoneNumber: `+1${this.phone}`,
      },
      (err, res) => {
        if (err) {
          return console.error(err);
        }
        console.log(res);
        this.codeSent = true;
      },
    );
  }

  onLogin() {
    console.log(`+1${this.phone}`, this.code);
    auth.passwordlessLogin(
      {
        connection: 'sms',
        phoneNumber: `+1${this.phone}`.trim(),
        verificationCode: this.code.toString(),
      },
      (err, res) => {
        if (err) {
          return console.error(err);
        }
        console.log(res);
        console.log('logged in!');
      },
    );
  }
}
