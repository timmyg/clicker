import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import auth0 from 'auth0-js';
import { UserService } from '../core/services/user.service';
import { getUserId } from '../state/user';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromUser from '../state/user/user.actions';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from '../globals';

const auth = new auth0.WebAuth({
  domain: environment.auth0.domain,
  clientID: environment.auth0.clientId,
  scope: 'read:current_user',
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
    private segment: SegmentService,
    private globals: Globals,
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
    auth.parseHash({ hash: fragment }, async (err, authResult) => {
      if (err) {
        console.error(err);
        this.router.navigate(['/tabs/profile'], { replaceUrl: true });
      } else if (authResult) {
        // alias user (move tokens to new user)
        const jwt = authResult.idToken;
        const newUserId = authResult.idTokenPayload.sub.replace('sms|', '');

        this.userId$.pipe(first(val => !!val)).subscribe(oldUserId => {
          this.store.dispatch(new fromUser.Alias(oldUserId, newUserId));
          this.segment.alias(newUserId, oldUserId);
          this.segment.track(this.globals.events.login.completed);
          this.userService.setToken(jwt);
          setTimeout(async () => {
            this.router.navigate(['/tabs/profile'], { replaceUrl: true });
            const toast = await context.toastController.create({
              message: `Successfully logged in.`,
              duration: 2000,
              cssClass: 'ion-text-center',
            });
            toast.present();
          }, 3000);
        });
      }
    });
  }
}
