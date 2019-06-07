import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import * as fromUser from './state/user/user.actions';

const { SplashScreen, StatusBar } = Plugins;
import { Store } from '@ngrx/store';

import * as fromStore from './state/app.reducer';
import { Observable } from 'rxjs';
import { getPartner } from './state/app';
import { SegmentService } from 'ngx-segment-analytics';

import { getUserId } from './state/user';
import { Globals } from './globals';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  partner$: Observable<string>;

  constructor(
    private platform: Platform,
    private store: Store<fromStore.AppState>,
    private segment: SegmentService,
    private globals: Globals,
  ) {
    this.partner$ = this.store.select(getPartner);
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(async () => {
      try {
        this.store.select(getUserId).subscribe(userId => {
          this.segment.identify(userId.replace('sms|', ''));
          this.segment.track(this.globals.events.opened);
        });
        await SplashScreen.hide();
      } catch (e) {}
    });
    this.platform.resume.subscribe(() => {
      this.segment.track(this.globals.events.opened);
      this.store.dispatch(new fromUser.Refresh());
    });
  }
}
