import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription, SubscriptionLike } from 'rxjs';
import { Program } from 'src/app/state/program/program.model';
import { Store } from '@ngrx/store';
import { getAllPrograms, getLoading } from 'src/app/state/program';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromProgram from '../../../state/program/program.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { ReserveService } from '../../reserve.service';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { first } from 'rxjs/operators';
import { ofType, Actions } from '@ngrx/effects';
import { InfoComponent } from './info/info.component';
import { ModalController, ToastController, Platform } from '@ionic/angular';

@Component({
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
})
export class ProgramsComponent implements OnDestroy, OnInit {
  programs$: Observable<Program[]>;
  reservation$: Observable<Partial<Reservation>>;
  isLoading$: Observable<boolean>;
  sub: Subscription;
  title = 'Choose Channel';
  searchTerm: string;
  refreshSubscription: Subscription;
  searchSubscription: Subscription;
  closeSearchSubscription: Subscription;
  infoModal;

  constructor(
    private store: Store<fromStore.AppState>,
    public reserveService: ReserveService,
    private modalController: ModalController,
    public toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private route: ActivatedRoute,
    private actions$: Actions,
  ) {
    this.programs$ = this.store.select(getAllPrograms);
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
    this.searchSubscription = this.reserveService.searchTermEmitted$.subscribe(searchTerm => {
      this.searchTerm = searchTerm;
    });
    this.closeSearchSubscription = this.reserveService.closeSearchEmitted$.subscribe(() => {
      this.searchTerm = null;
    });
    this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(() => this.refresh());
  }

  ngOnInit() {
    this.isLoading$ = this.store.select(getLoading);
    this.reservation$
      .pipe(first())
      .subscribe(reservation => this.store.dispatch(new fromProgram.GetAllByLocation(reservation.location)));
  }

  refresh() {
    this.reservation$
      .pipe(first())
      .subscribe(reservation => this.store.dispatch(new fromProgram.GetAllByLocation(reservation.location)));
    this.actions$
      .pipe(ofType(fromProgram.GET_PROGRAMS_SUCCESS))
      .pipe(first())
      .subscribe(() => {
        this.reserveService.emitRefreshed();
      });
    this.actions$
      .pipe(ofType(fromProgram.GET_PROGRAMS_FAIL))
      .pipe(first())
      .subscribe(async () => {
        const whoops = await this.toastController.create({
          message: 'Something went wrong. Please try again.',
          color: 'danger',
          duration: 4000,
          cssClass: 'ion-text-center',
        });
        whoops.present();
        this.reserveService.emitRefreshed();
      });
  }

  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.closeSearchSubscription.unsubscribe();
    if (this.sub) this.sub.unsubscribe();
  }

  async onProgramSelect(program: Program) {
    this.reserveService.emitCloseSearch();
    this.store.dispatch(new fromReservation.SetProgram(program));
    // if editing, may already have a tv
    const state = await this.store.pipe(first()).toPromise();
    const reservation: Partial<Reservation> = state.reservation.reservation;
    if (reservation.id && reservation.box && reservation.box.label) {
      this.router.navigate(['../confirmation'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate(['../tvs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    }
  }

  async onProgramInfo(program: Program) {
    this.infoModal = await this.modalController.create({
      component: InfoComponent,
      componentProps: { program },
    });
    this.sub = this.platform.backButton.pipe(first()).subscribe(() => {
      if (this.infoModal) this.infoModal.close();
    });
    this.infoModal.present();
  }
}
