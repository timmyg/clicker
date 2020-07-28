import { Component } from "@angular/core";
import { Reservation } from "../state/reservation/reservation.model";
import { Observable, Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromStore from "../state/app.reducer";
import {
  getAllReservations,
  getLoading as getReservationLoading,
} from "../state/reservation";
import { getUser, getLoading as getWalletLoading } from "../state/user";
import {
  ModalController,
  AlertController,
  ToastController,
  Platform,
  ActionSheetController,
} from "@ionic/angular";
import * as fromReservation from "../state/reservation/reservation.actions";
import * as fromUser from "../state/user/user.actions";
import { Router, ActivatedRoute } from "@angular/router";
import { User } from "../state/user/user.model";
import * as moment from "moment";
import { UserService } from "../core/services/user.service";
import { take, first } from "rxjs/operators";
import { ofType, Actions } from "@ngrx/effects";
import { SegmentService } from "ngx-segment-analytics";
import { Globals } from "../globals";
import { ToastOptions } from "@ionic/core";
import { AppService } from "../core/services/app.service";
import { Deploy } from "cordova-plugin-ionic/dist/ngx";
import { ICurrentConfig } from "cordova-plugin-ionic/dist/IonicCordova";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage {
  reservations$: Observable<Reservation[]>;
  user$: Observable<User>;
  isReservationsLoading$: Observable<boolean>;
  isWalletLoading$: Observable<boolean>;
  sub: Subscription;
  sub2: Subscription;

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
    public alertController: AlertController,
    public appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    public toastController: ToastController,
    public userService: UserService,
    private actions$: Actions,
    private platform: Platform,
    public actionSheetController: ActionSheetController,
    private segment: SegmentService,
    private globals: Globals,
    private deploy: Deploy
  ) {
    this.reservations$ = this.store.select(getAllReservations);
    this.user$ = this.store.select(getUser);
    this.isReservationsLoading$ = this.store.select(getReservationLoading);
    this.isWalletLoading$ = this.store.select(getWalletLoading);
  }

  ngOnInit() {
    this.reservations$.pipe(first()).subscribe((reservations) => {
      if (!reservations) {
        this.store.dispatch(new fromReservation.GetAll());
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }

  onModify(reservation: Reservation) {
    if (reservation.minutes > 0) {
      const endTime = moment(reservation.end);
      const duration = moment.duration(endTime.diff(moment())).asMilliseconds();
      if (duration > 0) {
        this.showModify(reservation);
      } else {
        this.showToast("Sorry, your reservation has expired.", true);
      }
    } else {
      this.showToast(
        "Sorry, you did not reserve this TV for a time period.",
        true
      );
    }
  }

  async showToast(message, showNewReservation = false) {
    const toastOptions: ToastOptions = {
      message: message,
      duration: 4000,
      cssClass: "ion-text-center",
    };
    let toast;
    if (showNewReservation) {
      toastOptions.buttons = [
        {
          side: "end",
          text: "Reserve Now",
          handler: () => {
            this.router.navigate(["/tabs/reserve"]);
            toast.dismiss();
          },
        },
      ];
    }
    toast = await this.toastController.create(toastOptions);
    toast.present();
  }

  createNewReservation(source: string) {
    this.store.dispatch(new fromReservation.Start());
    this.router.navigate(["/tabs/reserve/locations"], {
      relativeTo: this.route,
    });
    if (source === "fab") {
      this.segment.track(this.globals.events.reservation.clickedButton);
    } else if (source === "link") {
      this.segment.track(this.globals.events.reservation.clickedLink);
    }
  }

  // this will make sure it disappears from screen if you stay on screen
  // ... definitely a better way to do this
  isActive(reservation: Reservation) {
    const remaining = moment
      .duration(moment(reservation.end).diff(moment()))
      .asSeconds();
    return remaining > 0;
  }

  async showModify(reservation: Reservation) {
    const actionSheet = await this.actionSheetController.create({
      header: "Modify Reservation",
      buttons: [
        {
          text: "Change Channel",
          handler: () => {
            const reservationToUpdate = Object.assign({}, reservation);
            delete reservationToUpdate.program;
            this.store.dispatch(
              new fromReservation.SetForUpdateChannel(reservationToUpdate)
            );
            this.router.navigate(["/tabs/reserve"]);
          },
        },
        {
          text: "Add Time",
          handler: () => {
            const reservationToUpdate = Object.assign({}, reservation);
            this.store.dispatch(
              new fromReservation.SetForUpdateTime(reservationToUpdate)
            );
            this.router.navigate(["/tabs/reserve"]);
          },
        },
        {
          text: "Cancel Reservation",
          role: "destructive",
          handler: () => {
            this.onReservationCancel(reservation);
          },
        },
      ],
    });
    await actionSheet.present();
  }

  async onReservationCancel(reservation: Reservation) {
    const alert = await this.alertController.create({
      header: "Are you sure?",
      message:
        "You will not be refunded any tokens, but you will be freeing up a TV for others, which is appreciated ✌️",
      buttons: [
        {
          text: "Cancel Reservation",
          role: "destructive",
          cssClass: "danger",
          handler: () => {
            this.store.dispatch(new fromReservation.Cancel(reservation));
            this.segment.track(this.globals.events.reservation.cancelled);
            // clearInterval(this.intervalJobId);
          },
        },
      ],
    });

    await alert.present();
  }

  doRefresh(event) {
    this.store.dispatch(new fromReservation.GetAll());
    this.store.dispatch(new fromUser.Load());
    // zip(
    this.actions$
      .pipe(
        ofType(fromReservation.GET_RESERVATIONS_SUCCESS),
        take(1)
      )
      .subscribe(() => {
        event.target.complete();
      });
  }

  async showVersion() {
    // this.showVersionClicks++;
    // if (this.showVersionClicks >= 1) {
      const version = this.appService.getVersion();
      const configuration: ICurrentConfig = await this.deploy.getConfiguration();
      const toast = await this.toastController.create({
        message: `Version: ${version} 😏 (${configuration.channel})`,
        duration: 3000,
        cssClass: "ion-text-center",
      });
      await toast.present();
    //   this.showVersionClicks = 0;
    // }
  }

  getStoreName() {
    let storeName = "app store";
    if (this.platform.is("ios")) {
      storeName = "App Store";
    } else if (this.platform.is("android")) {
      storeName = "Play Store";
    }
    return storeName;
  }
}
