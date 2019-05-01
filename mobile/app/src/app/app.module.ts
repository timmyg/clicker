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

export function initApplication(store: Store<AppState>): Function {
  return () =>
    new Promise(resolve => {
      console.log('promise');
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
      // load user on startup
      // TODO i dont think its waiting until its actually loaded...
      provide: APP_INITIALIZER,
      useFactory: initApplication,
      // return () =>
      // new Promise(resolve => {
      //   console.log('promise...');
      //   const loaded$ = new Subject();
      //   store.dispatch(new fromUser.Load());
      //   store
      //     .select((state: AppState) => state.user.me)
      //     // .select((state: AppState) => state.user.authToken && state.user.authToken.length)
      //     // .select((state: AppState) => false)
      //     .pipe(takeUntil(loaded$))
      //     .subscribe(loaded => {
      //       console.log('returned...');
      //       if (loaded) {
      //         console.log('resolved');
      //         loaded$.next();
      //         resolve();
      //       }
      //     });
      // });
      // new Promise(resolve => {
      //   console.log('promise');
      //   store.dispatch(new fromUser.Load());
      //   // store.dispatch(new LoadUsers());
      //   store
      //     .select((state: any) => state.user)
      //     .pipe(
      //       filter(user => user.authToken && user.authToken.length),
      //       take(1),
      //     )
      //     .subscribe(users => {
      //       console.log('resolve', users);
      //       //  store.dispatch(new FinishAppInitializer());
      //       // resolve(true);
      //     });
      // });
      // },
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
