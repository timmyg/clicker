import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StateModule } from './state/state.module';
import { CoreModule } from './core/core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './api-interceptor';
import { Store } from '@ngrx/store';
import { AppState } from './state/app.reducer';
import * as fromUser from './state/user/user.actions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

function initApplication(): Function {
  return () => new Promise(resolve => setTimeout(resolve, 1000));
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, StateModule.forRoot(), CoreModule.forRoot()],
  providers: [
    {
      // load user on startup
      // TODO i dont think its waiting until its actually loaded...
      provide: APP_INITIALIZER,
      useFactory: (store: Store<AppState>) => {
        return () =>
          new Promise(resolve => {
            const loaded$ = new Subject();
            store.dispatch(new fromUser.Get());
            store
              .select((state: AppState) => state.user.me)
              .pipe(takeUntil(loaded$))
              .subscribe(loaded => {
                if (loaded) {
                  loaded$.next();
                  resolve();
                }
              });
          });
      },
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
