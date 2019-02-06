import { Component, OnInit } from '@angular/core';
import { Reservation } from '../state/reservation/reservation.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getAllReservations } from '../state/reservation';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  reservations$: Observable<Reservation[]>;

  constructor(private store: Store<fromStore.AppState>) {
    this.reservations$ = this.store.select(getAllReservations);
  }

  ngOnInit() {}
}
