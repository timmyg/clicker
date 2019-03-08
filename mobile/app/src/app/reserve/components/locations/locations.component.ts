import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Establishment } from 'src/app/state/location/location.model';
import { ReserveService } from '../../reserve.service';
import { Observable } from 'rxjs';
import { getAllLocations } from 'src/app/state/location';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../state/app.reducer';
import * as fromLocation from '../../../state/location/location.actions';
@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  locations$: Observable<Establishment[]>;
  title = 'Choose Location';

  constructor(private store: Store<fromStore.AppState>, private reserveService: ReserveService) {
    this.locations$ = this.store.select(getAllLocations);
    this.reserveService.emitTitle(this.title);
  }

  ngOnInit() {
    console.log('locations oninit');
    this.store.dispatch(new fromLocation.GetAllLocations());
  }

  onLocationClick(location: Establishment) {
    // this.chooseLocation.emit(location);
  }
}
