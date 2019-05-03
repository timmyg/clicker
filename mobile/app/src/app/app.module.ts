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
import { filter, take } from 'rxjs/operators';

export function initUserStuff(store: Store<AppState>): Function {
  return () =>
    new Promise(resolve => {
      store.dispatch(new fromUser.Load());
      store
        .select((state: any) => state.user)
        .pipe(
          filter(user => user.authToken && user.authToken.length),
          take(1),
        )
        .subscribe(authToken => {
          resolve(true);
        });
    });
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    StateModule.forRoot(),
    CoreModule.forRoot(),
    IntercomModule.forRoot({
      appId: 'lp9l5d9l', // from your Intercom config
      updateOnRouterChange: true, // will automatically run `update` on router event changes. Default: `false`
    }),
  ],
  providers: [
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
