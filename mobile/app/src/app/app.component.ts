import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Plugins, StatusBarStyle } from '@capacitor/core';

const { SplashScreen, StatusBar } = Plugins;
import { Store } from '@ngrx/store';

import * as fromStore from './state/app.reducer';
import { Observable } from 'rxjs';
import { getPartner } from './state/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  partner$: Observable<string>;

  constructor(private platform: Platform, private store: Store<fromStore.AppState>) {
    this.partner$ = this.store.select(getPartner);
    this.initializeApp();
  }

  async initializeApp() {
    console.log('initializeApp');
    // clg
    this.platform.ready().then(async () => {
      try {
        console.log('platform ready');
        // StatusBar.setStyle({
        //   style: StatusBarStyle.Light,
        // });
        await SplashScreen.hide();
      } catch (e) {
        console.log(e);
      }
    });
  }
}
