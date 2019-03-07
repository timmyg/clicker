import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { getLoading, getError } from '../state/location';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromLocation from '../state/location/location.actions';
import * as fromGame from '../state/game/game.actions';
import * as fromTv from '../state/tv/tv.actions';
import * as fromReservation from '../state/reservation/reservation.actions';
import { NavController } from '@ionic/angular';
import { Reservation } from '../state/reservation/reservation.model';
import { Establishment } from '../state/location/location.model';
import { Game } from '../state/game/game.model';
import { TV } from '../state/tv/tv.model';
import { getAllLocations } from 'src/app/state/location';
import { getAllGames } from 'src/app/state/game';
import { getAllTvs } from 'src/app/state/tv';
import { getAllReservations } from 'src/app/state/reservation';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage implements OnInit {
  loading$: Observable<boolean>;
  error$: Observable<string>;
  locations$: Observable<Establishment[]>;
  games$: Observable<Game[]>;
  tvs$: Observable<TV[]>;
  reservations$: Observable<Reservation[]>;
  reservation: Reservation;
  title: String;
  activeStep: String;
  searchGamesMode = false;

  constructor(
    private store: Store<fromStore.AppState>,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.loading$ = this.store.select(getLoading);
    this.error$ = this.store.select(getError);
    this.locations$ = this.store.select(getAllLocations);
    this.games$ = this.store.select(getAllGames);
    this.reservations$ = this.store.select(getAllReservations);
    this.tvs$ = this.store.select(getAllTvs);
  }

  ngOnInit() {
    this.reservation = new Reservation();
    // if theres a reservation being passed in, set it to the reservation
    this.route.paramMap.subscribe(paramsMap => {
      const reservationId = paramsMap.get('reservationId');
      console.log(reservationId);
      this.reservations$.subscribe(reservations => {
        console.log({ reservations });
        const selectedReservation = reservations.find(r => r.id === reservationId);
        if (selectedReservation) {
          this.activeStep = 'games';
          this.reservation = selectedReservation;
        }
      });
    });
    this.route.queryParamMap.subscribe(queryParamMap => {
      console.log(queryParamMap);
      if (queryParamMap && queryParamMap.get('step')) {
        this.activeStep = queryParamMap.get('step');
      }
    });
    this.route.queryParams.subscribe(val => {
      console.log(val);
    });
    this.route.queryParamMap.pipe(map(params => console.log(params)));
    this.store.dispatch(new fromLocation.GetAllLocations());
    this.store.dispatch(new fromGame.GetAllGames());
    this.store.dispatch(new fromTv.GetAllTvs());
    this.store.dispatch(new fromReservation.GetAllReservations());
  }

  onChooseLocation(location: Establishment) {
    this.reservation.location = location;
    let navigationExtras: NavigationExtras = {
      queryParams: { step: 'games' },
    };
    this.router.navigate([], navigationExtras);
  }
  onChooseGame(game: Game) {
    this.reservation.game = game;
    this.navigateToStep('tvs');
  }
  onChooseTv(tv: TV) {
    this.reservation.tv = tv;
    this.navigateToStep('confirmation');
  }
  onConfirm(reservation: Reservation) {
    this.store.dispatch(new fromReservation.CreateReservation(reservation));
    this.navCtrl.navigateForward('/tabs/profile');
    this.reservation = new Reservation();
  }

  private navigateToStep(stepName: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: { step: stepName },
    };
    console.log(navigationExtras);
    this.router.navigate([], navigationExtras);
  }

  onChangeTitle(title: String) {
    this.title = title;
  }

  goBack() {
    this.navCtrl.back();
  }
}
