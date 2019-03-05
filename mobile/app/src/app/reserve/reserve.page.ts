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
import { Storage } from '@ionic/storage';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private store: Store<fromStore.AppState>, private navCtrl: NavController,
    private storage: Storage, private route: ActivatedRoute) {
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
      const reservationId = paramsMap.get('reservationId')
      console.log(reservationId)
      this.reservations$.subscribe(reservations => {
        console.log({reservations})
        const selectedReservation = reservations.find(r => r.id === reservationId);
        if (selectedReservation) {
          selectedReservation.activeStep === 'games';
          this.reservation = selectedReservation;
        }
      })
    });
    this.store.dispatch(new fromLocation.GetAllLocations());
    this.store.dispatch(new fromGame.GetAllGames());
    this.store.dispatch(new fromTv.GetAllTvs());
    this.store.dispatch(new fromReservation.GetAllReservations());
  }

  onChooseLocation(location: Establishment) {
    this.reservation.location = location;
    this.reservation.activeStep = 'games';
  }
  onChooseGame(game: Game) {
    this.reservation.game = game;
    this.reservation.activeStep = 'tvs';
  }
  onChooseTv(tv: TV) {
    this.reservation.tv = tv;
    this.reservation.activeStep = 'confirmation';
  }
  onConfirm(reservation: Reservation) {
    this.store.dispatch(new fromReservation.CreateReservation(reservation));
    this.navCtrl.navigateForward('/tabs/profile');
    this.reservation = new Reservation();
  }
}
