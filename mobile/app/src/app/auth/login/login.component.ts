import { Component, ViewChild } from '@angular/core';
import { ModalController, ToastController, IonInput } from '@ionic/angular';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from 'src/app/globals';
import { UserService } from 'src/app/core/services/user.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromStore from '../../state/app.reducer';
import * as fromUser from '../../state/user/user.actions';
import { getUserId } from 'src/app/state/user';
import { first } from 'rxjs/operators';
import * as decode from 'jwt-decode';
import { Device } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @ViewChild('phoneInput') phoneInput: IonInput;
  @ViewChild('codeInput') codeInput: IonInput;
  phone: string;
  code: string;
  codeSent: boolean;
  waiting: boolean;
  userId$: Observable<string>;
  deviceUuid: string;

  constructor(
    public modalController: ModalController,
    public toastController: ToastController,
    private segment: SegmentService,
    private globals: Globals,
    private userService: UserService,
    private store: Store<fromStore.AppState>,
  ) {
    this.userId$ = this.store.select(getUserId);
  }

  async ngOnInit() {
    const info = await Device.getInfo();
    this.deviceUuid = info.uuid;
    //timeout of 100 blows up whole component on ios, also tried in ngAfterViewChecked
    setTimeout(() => this.phoneInput.setFocus(), 1000);
  }

  // ngAfterViewChecked() {
  //   this.phoneInput.setFocus();
  // }

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
        setTimeout(() => this.codeInput.setFocus(), 1000);
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
    this.userService.loginVerify(`+1${this.phone}`, this.code, this.deviceUuid).subscribe(
      token => {
        this.segment.track(this.globals.events.login.completed);
        this.waiting = false;
        this.saveTokenAndClose(token);
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
  }

  isEligibleCode() {
    return this.code && this.code.toString().length >= 4;
  }

  saveTokenAndClose(token: string) {
    // alias user (move tokens to new user)
    const newUserId = decode(token).sub;
    this.userId$.pipe(first(val => !!val)).subscribe(async oldUserId => {
      this.store.dispatch(new fromUser.Alias(oldUserId, newUserId));
      this.segment.alias(newUserId, oldUserId);
      this.segment.track(this.globals.events.login.completed);
      this.userService.setToken(token);
      const toast = await this.toastController.create({
        message: `Successfully logged in.`,
        duration: 2000,
        cssClass: 'ion-text-center',
      });
      toast.present();
      this.modalController.dismiss();
    });
  }
}
