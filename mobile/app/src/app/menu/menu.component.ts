import { Component, OnInit } from "@angular/core";
import {
  AlertController,
  ActionSheetController,
  ToastController,
  Platform,
  ModalController,
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
// import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from "../globals";
import { LoginComponent } from "../auth/login/login.component";
import { Subscription, Observable } from "rxjs";
import { first } from "rxjs/operators";
import { ReferralPage } from "../referral/referral.page";
import { isLoggedIn } from "../state/user";
import { User } from "@sentry/browser";
import { Store } from "@ngrx/store";
import * as fromStore from "../state/app.reducer";
import * as fromUser from "../state/user/user.actions";
import { getUser, getLoading as getWalletLoading } from "../state/user";
import { SuggestComponent } from "../suggest/suggest.component";
declare var window: any;

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent {
  user$: Observable<User>;
  suggestModal;
  referralModal;
  loginModal;
  rating = {
    cookieName: "rating",
    given: "given",
  };
  showRatingLink = false;
  sub: Subscription;
  isLoggedIn$: Observable<boolean>;
  isLoggedIn: boolean;

  constructor(
    public alertController: AlertController,
    private storage: Storage,
    public actionSheetController: ActionSheetController,
    public toastController: ToastController,
    // private segment: SegmentService,
    private platform: Platform,
    public modalController: ModalController,
    private globals: Globals,
    private store: Store<fromStore.AppState>
  ) {
    this.isLoggedIn$ = this.store.select(isLoggedIn);
    this.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });
    this.user$ = this.store.select(getUser);
  }

  ngOnInit() {
    this.user$.pipe(first()).subscribe((user) => {
      console.log({ user });
      if (!user) {
        this.store.dispatch(new fromUser.Load());
      }
    });
    this.platform.backButton.pipe(first()).subscribe(() => {
      // android
      if (this.loginModal) {
        this.loginModal.close();
      }
    });
    this.configureRating();
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: "Are you sure?",
      message: "Your existing reservations will not be affected.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Logout",
          role: "destructive",
          cssClass: "secondary",
          handler: async () => {
            const originalToken = await this.storage.get("originalToken");
            await this.storage.clear();
            // await this.storage.remove(items[i].id);
            await this.storage.set("originalToken", originalToken);
            await this.storage.set("token", originalToken);
            return location.reload();
          },
        },
      ],
    });

    await alert.present();
  }

  async onRate() {
    const actionSheet = await this.actionSheetController.create({
      header: "Rate the Clicker TV app",
      buttons: [
        {
          text: "I already left a rating",
          handler: async () => {
            await this.storage.set(this.rating.cookieName, this.rating.given);
            this.showRatingLink = false;
            const toast = await this.toastController.create({
              message: `We appreciate it! 🙌😁😍🎉😻🎈`,
              duration: 3000,
              cssClass: "ion-text-center",
            });
            await toast.present();
            // this.segment.track(this.globals.events.rated);
            // this.segment.identify(null, { rated: true });
          },
        },
        {
          text: "Leave rating",
          handler: async () => {
            await this.storage.set(this.rating.cookieName, this.rating.given);
            let link = "https://tryclicker.com";
            console.log("checking platform type");
            if (this.platform.is("ios")) {
              console.log("is ios");
              link =
                "itms-apps://itunes.apple.com/app/apple-store/id1471666907?mt=8";
            } else if (this.platform.is("android")) {
              console.log("is android");
              link = "market://details?id=com.teamclicker.app";
            }
            window.open(link);
            return null;
          },
        },
      ],
    });

    await actionSheet.present();
  }

  async onLogin() {
    this.loginModal = await this.modalController.create({
      component: LoginComponent,
    });
    this.sub = this.platform.backButton.pipe(first()).subscribe(() => {
      if (this.loginModal) {
        this.loginModal.close();
      }
    });
    return await this.loginModal.present();
  }

  async onContact() {
    window.drift.on("ready", function(api) {
      console.log(api);
      // api.widget.show();
      api.openChat();
    });
  }

  async onSuggestLocation() {
    this.suggestModal = await this.modalController.create({
      component: SuggestComponent,
    });
    this.sub = this.platform.backButton.pipe(first()).subscribe(() => {
      if (this.suggestModal) {
        this.suggestModal.close();
      }
    });
    return await this.suggestModal.present();
  }

  async onOpenReferral() {
    if (this.isLoggedIn) {
      this.referralModal = await this.modalController.create({
        component: ReferralPage,
      });
      this.sub = this.platform.backButton.pipe(first()).subscribe(() => {
        if (this.referralModal) {
          this.referralModal.close();
        }
      });
      return await this.referralModal.present();
    } else {
      const toast = await this.toastController.create({
        message: `✋ You must be logged in to get free tokens.`,
        duration: 4000,
        buttons: [
          {
            side: "end",
            text: "Login",
            handler: async () => {
              this.loginModal = await this.modalController.create({
                component: LoginComponent,
              });
              this.sub = this.platform.backButton
                .pipe(first())
                .subscribe(() => {
                  if (this.loginModal) {
                    this.loginModal.close();
                  }
                });
              return await this.loginModal.present();
            },
          },
        ],
      });
      toast.present();
    }
  }

  async configureRating() {
    const rating = await this.storage.get(this.rating.cookieName);
    if (rating === this.rating.given) {
      this.showRatingLink = false;
    } else {
      this.showRatingLink = true;
    }
  }
}
