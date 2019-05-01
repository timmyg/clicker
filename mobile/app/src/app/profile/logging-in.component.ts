import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import auth0 from 'auth0-js';
import { UserService } from '../core/services/user.service';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromUser from '../state/user/user.actions';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

const auth = new auth0.WebAuth({
  domain: environment.auth0.domain,
  clientID: environment.auth0.clientId,
  responseType: 'token id_token',
});

@Component({
  template:
    '<ion-row class="ion-justify-content-center" margin-top><ion-spinner name="crescent"></ion-spinner></ion-row>',
})
export class LoggingInComponent {
  constructor(
    private store: Store<fromStore.AppState>,
    public userService: UserService,
    public toastController: ToastController,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.fragment.subscribe((fragment: string) => {
      if (fragment) {
        this.processLogin(fragment);
      }
    });
  }

  private processLogin(fragment: string) {
    const context = this;
    console.log(fragment);
    auth.parseHash({ hash: fragment }, async (err, authResult) => {
      console.log(authResult);
      if (err) {
        return console.log(err);
      } else if (authResult) {
        const jwt = authResult.idToken;
        this.userService.set(jwt);
        this.store.dispatch(new fromUser.Load());
        // const jwtPayload = authResult.idTokenPayload;
        // localStorage.setItem('accessToken', authResult.accessToken);
        // auth.client.userInfo(authResult.accessToken, async (err, user) => {
        //   if (err) {
        //     console.log('err', err);
        //     alert('There was an error retrieving your profile: ' + err.message);
        //   } else {
        //     // Hide the login UI, show a user profile element with name and image
        //     console.log(user);
        //   }
        // });

        // TODO merge/update user
        const toast = await context.toastController.create({
          message: `Successfully logged in.`,
          duration: 2000,
          cssClass: 'ion-text-center',
        });
        toast.present();
      }
    });
  }
}
