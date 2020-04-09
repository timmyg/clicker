import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { Plugins } from "@capacitor/core";
import * as fromUser from "./state/user/user.actions";

const { Device, SplashScreen } = Plugins;
import { Store } from "@ngrx/store";

import * as fromStore from "./state/app.reducer";
import { Observable } from "rxjs";
import { getPartner } from "./state/app";
// import { SegmentService } from "ngx-segment-analytics";

import { getUserId } from "./state/user";
import { Globals } from "./globals";
import { first } from "rxjs/operators";
import { AppService } from "./core/services/app.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  partner$: Observable<string>;
  // public version: string = version;

  constructor(
    private platform: Platform,
    private store: Store<fromStore.AppState>,
    // private segment: SegmentService,
    private globals: Globals,
    public appService: AppService
  ) {
    this.partner$ = this.store.select(getPartner);
    // console.log("set version", version);

    // this.appService.setVersion(version);
    this.initializeApp();
  }

  async initializeApp() {
    const version = this.appService.getVersion();
    this.platform.ready().then(async () => {
      try {
        this.store
          .select(getUserId)
          .pipe(first((val) => !!val))
          .subscribe(async (userId) => {
            const info = await Device.getInfo();
            const { manufacturer, model, osVersion, platform, uuid } = info;
            // await this.segment.identify(
            //   userId,
            //   { version, manufacturer, model, osVersion, platform, uuid },
            //   {
            //     Intercom: { hideDefaultLauncher: true }
            //   }
            // );
            // await this.segment.track(this.globals.events.opened);
            // await this.intercom.boot({ app_id: environment.intercom.appId });
            // await this.intercom.update({ hide_default_launcher: true });
            await SplashScreen.hide();
          });
      } catch (e) {}
    });
    this.platform.resume.subscribe(() => {
      // this.segment.track(this.globals.events.opened, { version });
      this.store.dispatch(new fromUser.Refresh());
    });
  }
}
