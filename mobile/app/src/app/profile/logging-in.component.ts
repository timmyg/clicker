import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import auth0 from 'auth0-js';
import { UserService } from '../core/services/user.service';
import { getUser, getUserId } from '../state/user';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromUser from '../state/user/user.actions';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { User } from '../state/user/user.model';

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
  userId$: Observable<string>;

  constructor(
    private store: Store<fromStore.AppState>,
    public userService: UserService,
    public toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.userId$ = this.store.select(getUserId);
  }

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
        // alias user (move tokens to new user)
        const jwt = authResult.idToken;
        const newUserId = authResult.idTokenPayload.sub;
        this.userId$.subscribe(oldUserId => {
          console.log('alias', oldUserId, newUserId);
          this.store.dispatch(new fromUser.Alias(oldUserId, newUserId));
          setTimeout(() => {
            this.router.navigate(['/tabs/profile']);
          }, 3000);
        });
        // this.userId$.pipe(filter(id => !!id)
        // this.store$.pipe(
        //   select(getUserAuthToken),
        //   filter(authToken => authToken && authToken.length > 0),

        this.userService.set(jwt);
        // this.store.dispatch(new fromUser.Load());
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
        console.error('TODO send off merge request');
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
