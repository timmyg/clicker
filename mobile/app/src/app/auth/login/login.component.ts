import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import auth0 from 'auth0-js';
import { environment } from 'src/environments/environment';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from 'src/app/globals';
import { UserService } from 'src/app/core/services/user.service';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
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
  // redirectUri: `https://tryclicker.com/?test=4`,
  redirectUri: `https://develop.tryclicker.com/app/auth`,
  responseType: 'token id_token',
  prompt: 'none',
  packageId: environment.packageId,
});
// auth0.crossOriginVerification();

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
    private userService: UserService,
  ) {}

  onCloseClick() {
    this.modalController.dismiss();
  }

  async onPhoneSubmit() {
    this.waiting = true;
    // TODO these service should probably be using redux events
    this.userService.loginVerifyStart(`+1${this.phone}`).subscribe(
      result => {
        this.segment.track(this.globals.events.login.started);
        this.codeSent = true;
        this.waiting = false;
      },
      async err => {
        console.error(err);
        const toastInvalid = await this.toastController.create({
          message: 'Invalid phone number. Please enter your 10 digit phone number starting with area code.',
          color: 'danger',
          duration: 5000,
          cssClass: 'ion-text-center',
        });
        toastInvalid.present();
        this.waiting = false;
      },
    );
  }

  onCodeSubmit() {
    this.waiting = true;
    // TODO move to store
    this.userService.loginVerify(`+1${this.phone}`, this.code).subscribe(
      result => {
        this.segment.track(this.globals.events.login.completed);
        this.waiting = false;
        console.log('save token!', result);
      },
      async err => {
        console.error(err);
        const toastInvalid = await this.toastController.create({
          message: 'Invalid code.',
          color: 'danger',
          duration: 3000,
          cssClass: 'ion-text-center',
        });
        toastInvalid.present();
        this.waiting = false;
      },
    );
    // auth.passwordlessLogin(
    //   {
    //     connection: 'sms',
    //     phoneNumber: `+1${this.phone}`.trim(),
    //     verificationCode: this.code.toString(),
    //   },
    //   async (err, res) => {
    //     if (err) {
    //       const toastInvalid = await this.toastController.create({
    //         message: err.code === 'access_denied' ? 'Invalid code' : err.description,
    //         color: 'danger',
    //         duration: 4000,
    //         cssClass: 'ion-text-center',
    //       });
    //       toastInvalid.present();
    //       this.waiting = false;
    //       return console.error(err, JSON.stringify(window));
    //     }
    //     this.waiting = false;
    //   },
    // );
  }

  isEligibleCode() {
    return this.code && this.code.toString().length >= 4;
  }
}
