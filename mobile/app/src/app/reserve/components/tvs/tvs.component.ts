import { Component, OnDestroy, OnInit } from "@angular/core";
import { TV } from "src/app/state/location/tv.model";
import { Observable, Subscription } from "rxjs";
import { Reservation } from "src/app/state/reservation/reservation.model";
import { Store } from "@ngrx/store";
import { ReserveService } from "../../reserve.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as fromStore from "../../../state/app.reducer";
import * as fromReservation from "../../../state/reservation/reservation.actions";
import { getReservation, getReservationTvs } from "src/app/state/reservation";
import { ToastController } from "@ionic/angular";
import * as moment from "moment";
import { Actions, ofType } from "@ngrx/effects";
import { first } from "rxjs/operators";
import { getLoading } from "src/app/state/location";
import { Globals } from "src/app/globals";
import { SegmentService } from "ngx-segment-analytics";
import { getUserGeolocation } from "src/app/state/user";

@Component({
  selector: "app-tvs",
  templateUrl: "./tvs.component.html",
  styleUrls: ["./tvs.component.scss"]
})
export class TvsComponent implements OnDestroy, OnInit {
  tvs$: Observable<TV[]>;
  reservation$: Observable<Partial<Reservation>>;
  reservation: Partial<Reservation>;
  refreshSubscription: Subscription;
  title = "Choose TV";
  isLoading$: Observable<boolean>;
  userGeolocation$: Observable<{ latitude; longitude }>;
  userGeolocation: { latitude; longitude };

  constructor(
    private store: Store<fromStore.AppState>,
    public reserveService: ReserveService,
    private router: Router,
    private segment: SegmentService,
    private globals: Globals,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private actions$: Actions
  ) {
    this.tvs$ = this.store.select(getReservationTvs);
    this.tvs$.pipe(first()).subscribe(tvs => {
      if (tvs.length === 1 && (!tvs[0] && !tvs[0].live.locked)) {
        this.onTvClick(tvs[0], true);
      }
    });
    this.reservation$ = this.store.select(getReservation);
    this.reservation$.subscribe(r => (this.reservation = r));
    this.reserveService.emitTitle(this.title);
    this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(
      () => this.refresh()
    );
    this.userGeolocation$ = this.store.select(getUserGeolocation);
    this.userGeolocation$.subscribe(userGeolocation => {
      console.log({ userGeolocation });
      this.userGeolocation = userGeolocation;
    });
  }

  ngOnInit() {
    this.isLoading$ = this.store.select(getLoading);
  }

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
  }

  async onTvClick(tv: TV, removeFromHistory?: boolean) {
    if (tv.live.locked) {
      const toast = await this.toastController.create({
        message: `📺 ${tv.label} is reserved until ${moment(
          tv.live.lockedUntil
        ).format("h:mma")}.`,
        duration: 2000,
        cssClass: "ion-text-center"
      });
      toast.present();
      return await this.segment.track(this.globals.events.tv.reserved);
    }
    this.store.dispatch(new fromReservation.SetTv(tv));
    await this.segment.track(this.globals.events.reservation.selectedTV, tv);
    this.router.navigate(["../confirmation"], {
      relativeTo: this.route,
      replaceUrl: removeFromHistory
    });
  }

  refresh() {
    console.log(this.reservation.location);
    this.store.dispatch(
      new fromReservation.SetLocation(
        this.reservation.location,
        this.userGeolocation && this.userGeolocation.latitude,
        this.userGeolocation && this.userGeolocation.longitude
      )
    );
    this.actions$
      .pipe(ofType(fromReservation.SET_RESERVATION_LOCATION_SUCCESS))
      .pipe(first())
      .subscribe(() => {
        this.reserveService.emitRefreshed();
      });
  }
}
