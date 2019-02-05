import { Component, OnInit } from '@angular/core';
import { Establishment } from '../state/location/location.model';
import { Observable } from 'rxjs';
import { getAllLocations, getLoading, getError } from '../state/location';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromLocation from '../state/location/location.actions';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage implements OnInit {
  locations$: Observable<Array<Establishment>>;
  loading$: Observable<boolean>;
  error$: Observable<string>;

  constructor(private store: Store<fromStore.AppState>) {
    this.locations$ = this.store.select(getAllLocations);
    this.loading$ = this.store.select(getLoading);
    this.error$ = this.store.select(getError);
  }

  ngOnInit() {
    this.store.dispatch(new fromLocation.GetAllLocations());
  }
}
