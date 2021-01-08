import { Program } from "./../../../state/program/program.model";
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from "@angular/core";
import { Reservation } from "../../../state/reservation/reservation.model";
import { ReserveService } from "../../reserve.service";
import {
  Observable,
  Subscription,
  combineLatest,
  Subject,
  pipe,
  BehaviorSubject,
} from "rxjs";
import { Store, select } from "@ngrx/store";
import {
  getReservation,
  getReservationUpdateType,
} from "src/app/state/reservation";
import * as fromStore from "../../../state/app.reducer";
import * as fromReservation from "../../../state/reservation/reservation.actions";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { ToastController, ModalController, Platform } from "@ionic/angular";
import { first, filter, map } from "rxjs/operators";
import {
  isLoggedIn,
  getUserTokenCount,
  getUserId,
  getUserRoles,
} from "src/app/state/user";
import { Actions, ofType } from "@ngrx/effects";
import { SegmentService } from "ngx-segment-analytics";
import { Globals } from "src/app/globals";
import { Timeframe } from "src/app/state/app/timeframe.model";
import { getTimeframes } from "src/app/state/app";
import * as fromApp from "src/app/state/app/app.actions";
import { getLoading as getAppLoading } from "src/app/state/app";
import { LoginComponent } from "src/app/auth/login/login.component";

@Component({
  selector: "app-confirmation",
  templateUrl: "./confirmation.component.html",
  styleUrls: ["./confirmation.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush, // ExpressionChangedAfterItHasBeenCheckedError when opening wallet if not here
})
export class ConfirmationComponent implements OnDestroy, OnInit {
  timeframes$: Observable<Timeframe[]>;
  // visibleTimeframes$: Observable<Timeframe[]>;
  visibleTimeframes$: Subject<Timeframe[]> = new Subject();
  reservation$: Observable<Partial<Reservation>>;
  reservationUpdateType$: Observable<string>;
  reservationEnd$: Observable<Date>;
  tokenCount$: Observable<number>;
  userId$: Observable<string>;
  userRoles$: Observable<any>;
  // tokenCount: number;
  isLoggedIn$: Observable<boolean>;
  reservation: Partial<Reservation>;
  title = "Confirmation";
  isConflictingUser: boolean;
  isLoggedIn: boolean;
  saving: boolean;
  isEditMode: boolean;
  isEditTime: boolean;
  isEditChannel: boolean;
  isBoxLocked: boolean;
  sufficientFunds: boolean;
  rangeDistanceMiles = 1;
  outOfRange: boolean;
  isAppLoading$: Observable<boolean>;
  isAppLoading: boolean;
  isInitializing = true;
  sub: Subscription;
  timeframeSub: Subscription;
  autotuneSub: Subscription;
  timeframe0: Timeframe = {
    minutes: 0,
    tokens: 0,
  };
  overrideDistanceClicks = 0;
  overrideDistanceDisable = false;
  loginModal;
  // isAutotuneWaiting = true;
  // public isAutotuneWaiting$: BehaviorSubject<boolean> = new BehaviorSubject<
  //   boolean
  // >(true);

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    public toastController: ToastController,
    private actions$: Actions,
    private segment: SegmentService,
    private globals: Globals,
    private route: ActivatedRoute,
    public modalController: ModalController,
    private platform: Platform
  ) {
    this.timeframes$ = this.store.select(getTimeframes);
    this.reservation$ = this.store.select(getReservation);
    this.reservationUpdateType$ = this.store.select(getReservationUpdateType);
    this.reserveService.emitTitle(this.title);
    this.tokenCount$ = this.store.select(getUserTokenCount);
    this.userId$ = this.store.select(getUserId);
    this.isLoggedIn$ = this.store.select(isLoggedIn);
    // TODO this is ugly but gets rid of ExpressionChangedAfterItHasBeenCheckedError issue when opening wallet
    this.isAppLoading$ = this.store.pipe(select(getAppLoading));
    // this.sub = this.isAppLoading$.subscribe((x) => {
    //   console.log({ x });
    //   this.isAppLoading = x;
    // });
    this.userRoles$ = this.store.select(getUserRoles);
    const store2 = this.store;

    // const name$ = this._personService.getName(id);
    // const document$ = this._documentService.getDocument();
    // Observable.create((observer) => {
    this.timeframeSub = combineLatest(
      this.timeframes$,
      this.userRoles$,
      this.reservation$
    ).subscribe(([timeframes, roles, reservation]) => {
      // roles may be null
      if (!!timeframes && !!reservation && !!reservation.location) {
        // const manageLocations = roles && roles["manageLocations"];
        // const isManager =
        //   manageLocations && manageLocations.includes(reservation.location.id);
        if (reservation.location.free) {
          // timeframes = getFreeLocationTimeframe()
          // console.log({timeframes});
          // timeframes.map(t => {
          //   t.tokens = 0
          // })
          // console.log({timeframes});
          timeframes = [
            {
              minutes: 0,
              tokens: 0,
            },
          ];
          // reservation.minutes = 0;
          // console.log("dispatch");
          this.store.dispatch(new fromReservation.SetTimeframe(timeframes[0]));
          // this.reservation.cost = 0;
        }
        if (reservation.isVip) {
          timeframes.map((t) => {
            t.tokens = 0;
            t.isVip = true;
          });
        }
        if (reservation.isManager) {
          timeframes.unshift(this.getManagerFreeTimeframe());
        }
        console.log({ timeframes });
        this.visibleTimeframes$.next(timeframes);
        this.isBoxLocked = reservation.box?.live?.locked;
      }
    });

    // Observable
    //     .zip(this.timeframes$, this.userRoles$, (timeframes: Timeframe[], roles: any) => ({timeframes, roles}))
    //     .subscribe(pair => {
    //           //  this.name = pair.name;
    //           //  this.document = pair.document;
    //           //  this.showForm();
    //           console.log(timeframes, roles);
    //        })
  }

  ngOnDestroy() {
    // clear timeframes because it messes up the radio buttons when reloading
    this.store.dispatch(new fromApp.ClearTimeframes());
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.timeframeSub) {
      this.timeframeSub.unsubscribe();
    }
    if (this.autotuneSub) {
      this.autotuneSub.unsubscribe();
    }
  }

  ngOnInit() {
    // if updating a free reservation, auto change
    this.autotuneSub = combineLatest(
      this.reservationUpdateType$,
      this.reservation$,
      this.visibleTimeframes$
    )
      .pipe(first())
      .subscribe(([updateType, reservation, timeframes]) => {
        console.log({ updateType, reservation, timeframes });
        // console.log(reservation && reservation.location ? reservation.location.free : '');
        // const isUpdateFreeLocation = updateType === "channel" && reservation.location?.free;
        const freeTimeframe =
          timeframes && timeframes.length == 1 ? timeframes[0] : null;
        // const isFreeLocation = reservation.location?.free;
        if (!!updateType) {
          console.log("autotune!");
          this.store.dispatch(new fromReservation.SetTimeframe(freeTimeframe));
          this.onConfirm();
        }
        console.log("done");
        // this.isAutotuneWaiting$.next(false);
      });

    this.reservation$
      .pipe(
        filter((r) => r !== null),
        first()
      )
      .subscribe((reservation) => {
        if (reservation.location.distance > this.rangeDistanceMiles) {
          this.outOfRange = true;
        }
        this.store.dispatch(
          new fromApp.LoadTimeframes(reservation.location.id)
        );
        this.reservation = reservation;
        this.timeframes$
          .pipe(
            filter((t) => t !== null),
            first()
          )
          .subscribe((timeframes) => {
            if (this.reservation.minutes !== 0) {
              // const timeframe = timeframes[0];
              // this.reservation.cost = timeframe.tokens;
              // this.reservation.minutes = timeframe.minutes;
            }
            this.isInitializing = false;
          });
        // }
        // const updateType: string = state.reservation.updateType;
        // this.route.queryParams.subscribe(params => {
        // this.reservation.minutes = this.reservation.location.minutes;
        this.reservationUpdateType$.subscribe((updateType) => {
          if (updateType) {
            this.isEditMode = true;
            if (updateType === "channel") {
              this.isEditChannel = true;
              this.reservation.minutes = 0;
              this.reservation.cost = 0;
            } else if (updateType === "time") {
              this.isEditTime = true;
            }
            // this.userId$.subscribe(userId=> {
            //   this.isConflictingUser = userId
            // })
            combineLatest([this.userId$, this.reservation$])
              .pipe(map(([userId, reservation]) => ({ userId, reservation })))
              .subscribe((pair) => {
                this.isConflictingUser =
                  pair.userId !== pair.reservation.userId;
              });
          }
          this.isInitializing = false;
        });
      });
    // this.tokenCount$.subscribe(tokens => {
    //   this.tokenCount = tokens;
    // });
    this.isLoggedIn$.subscribe((isUserLoggedIn) => {
      this.isLoggedIn = isUserLoggedIn;
    });
  }

  getManagerFreeTimeframe(): Timeframe {
    return {
      tokens: 0,
      minutes: 0,
      isManager: true,
    };
  }

  getFreeLocationTimeframe(): Timeframe {
    return {
      tokens: 0,
      minutes: 0,
      isManager: true,
    };
  }

  getEndTime() {
    return this.isEditTime
      ? moment(this.reservation.end)
          .add(this.reservation.update.minutes.valueOf(), "minutes")
          .toDate()
      : moment(this.reservation.end)
          .add(this.reservation.minutes.valueOf(), "minutes")
          .toDate();
  }

  onConfirm() {
    const { reservation: r } = this;
    this.saving = true;
    this.isEditMode
      ? this.store.dispatch(new fromReservation.Update(r))
      : this.store.dispatch(new fromReservation.Create(r));
    const reservation = r;
    this.actions$
      .pipe(
        ofType(
          fromReservation.CREATE_RESERVATION_SUCCESS,
          fromReservation.UPDATE_RESERVATION_SUCCESS
        )
      )
      .pipe(first())
      .subscribe(() => {
        console.log({ r });
        const program =
          r.update && r.update.program ? r.update.program : r.program;
        const minutes =
          r.update && r.update.minutes ? r.update.minutes : r.minutes;
        const cost = r.update && r.update.cost ? r.update.cost : r.cost;
        if (this.isEditMode) {
          this.segment.track(this.globals.events.reservation.updated, {
            cost,
            minutes,
            locationName: r.location.name,
            locationNeighborhood: r.location.neighborhood,
            channelName: program.channelTitle,
            channelNumber: program.channel,
            programName: program.title,
            programDescription: program.description,
          });
        } else {
          this.segment.track(this.globals.events.reservation.created, {
            minutes: r.minutes,
            locationName: r.location.name,
            locationNeighborhood: r.location.neighborhood,
            channelName: program.channelTitle,
            channelNumber: program.channel,
            programName: program.title,
            programDescription: program.description,
          });
        }
        this.store.dispatch(new fromReservation.Start());
        this.router.navigate(["/tabs/profile"]);
        this.showTunedToast(
          reservation.box.label,
          this.getProgram().channelTitle
        );
      });
    this.actions$
      .pipe(
        ofType(
          fromReservation.CREATE_RESERVATION_FAIL,
          fromReservation.UPDATE_RESERVATION_FAIL
        )
      )
      .pipe(first())
      .subscribe(async () => {
        this.showErrorToast();
        this.saving = false;
        await this.segment.track(this.globals.events.reservation.failed);
      });
  }

  async showTunedToast(label: string, channelName: string) {
    const toast = await this.toastController.create({
      message: `📺 ${label} successfully changed to ${channelName}. ⚡`,
      duration: 2000,
      cssClass: "ion-text-center",
    });
    toast.present();
  }

  async showErrorToast() {
    const toast = await this.toastController.create({
      message: `Something went wrong, please try again.`,
      duration: 2000,
      cssClass: "ion-text-center",
      color: "danger",
    });
    toast.present();
  }

  async onTimeframeChange(e) {
    const timeframe: Timeframe = e.detail.value;
    this.store.dispatch(new fromReservation.SetTimeframe(timeframe));
  }

  // hasTimeframe() {
  //   return !!this.reservation.cost;
  // }

  isValid(): boolean {
    if (this.isEditChannel) {
      return true;
    } else if (this.isEditTime) {
      return !!this.reservation.update && !!this.reservation.update.minutes;
    } else {
      return this.reservation.minutes != null || this.reservation.location.free;
    }
  }

  getCost(): number {
    if (this.isEditTime) {
      return this.reservation.update && this.reservation.update.cost;
    } else {
      return this.reservation.cost;
    }
  }

  getProgram(): Program {
    if (this.isEditChannel) {
      return this.reservation.update.program;
    } else {
      return this.reservation.program;
    }
  }

  onClickOverrideDistanceForce() {
    this.overrideDistanceDisable = true;
  }

  onClickOverrideDistance() {
    this.overrideDistanceClicks++;
    if (this.overrideDistanceClicks === 7) {
      this.overrideDistanceDisable = true;
      this.overrideDistanceClicks = 0;
    }
  }

  getLocationName() {
    return `${this.reservation.location.name} (${this.reservation.location.neighborhood})`;
  }

  getChannelDescription() {
    return `${this.getProgram().title} on ${this.getProgram().channelTitle}`;
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
}
