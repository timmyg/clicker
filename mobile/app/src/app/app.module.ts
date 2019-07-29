import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IntercomModule } from 'ng-intercom';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StateModule } from './state/state.module';
import { CoreModule } from './core/core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './api-interceptor';
import { Store } from '@ngrx/store';
import { AppState } from './state/app.reducer';
import * as fromUser from './state/user/user.actions';
import * as fromApp from './state/app/app.actions';
import { filter, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { SegmentModule } from 'ngx-segment-analytics';
import { Globals } from './globals';

export function checkParams(store: Store<AppState>): Function {
  return () =>
    new Promise(resolve => {
      const urlParams = new URLSearchParams(window.location.search);
      const partner = urlParams.get('partner');
      if (partner) {
        store.dispatch(new fromApp.SetPartner(partner));
      }
      resolve(true);
    });
}

export function initUserStuff(store: Store<AppState>): Function {
  return () =>
    new Promise(resolve => {
      store.dispatch(new fromUser.Load()); // TODO should this be refresh?
      store
        .select((state: any) => state.user)
        .pipe(
          filter(user => user.authToken && user.authToken.length),
          take(1),
        )
        .subscribe(() => {
          resolve(true);
        });
    });
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    SegmentModule.forRoot({
      apiKey: environment.segment.writeKey,
      debug: !environment.production,
      loadOnInitialization: true,
    }),
    IonicModule.forRoot(),
    AppRoutingModule,
    StateModule.forRoot(),
    CoreModule.forRoot(),
    IntercomModule.forRoot({
      appId: environment.intercom.appId, // from your Intercom config
      updateOnRouterChange: true, // will automatically run `update` on router event changes. Default: `false`
      vertical_padding: 30,
      horizontal_padding: 30,
    }),
  ],
  providers: [
    Globals,
    {
      provide: APP_INITIALIZER,
      useFactory: checkParams,
      multi: true,
      deps: [Store],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initUserStuff,
      multi: true,
      deps: [Store],
    },
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    Geolocation,
    Diagnostic,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
