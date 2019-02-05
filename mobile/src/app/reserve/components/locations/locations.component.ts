import { Component, OnInit, Input } from '@angular/core';
import { Establishment } from 'src/app/state/location/location.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { getAllLocations } from 'src/app/state/location';
import * as fromStore from '../../../state/app.reducer';
import * as fromLocation from '../../../state/location/location.actions';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  locations$: Observable<Array<Establishment>>;

  constructor(private store: Store<fromStore.AppState>) {
    this.locations$ = this.store.select(getAllLocations);
  }

  ngOnInit() {
    this.store.dispatch(new fromLocation.GetAllLocations());
  }
}
