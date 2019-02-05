import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { getLoading, getError } from '../state/location';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage implements OnInit {
  loading$: Observable<boolean>;
  error$: Observable<string>;

  constructor(private store: Store<fromStore.AppState>) {
    this.loading$ = this.store.select(getLoading);
    this.error$ = this.store.select(getError);
  }

  ngOnInit() {}
}
