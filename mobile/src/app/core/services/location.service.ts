import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { Establishment } from '../../state/location/location.model';
import { delay } from 'rxjs/operators';

@Injectable()
export class LocationService {
  private url = 'api/locations';
  constructor(private httpClient: HttpClient) {}

  getLocations(): Observable<Array<Establishment>> {
    // return this.httpClient.get<Establishment[]>(this.url);
    const location1: Establishment = {
      id: 1,
      name: 'Buffalo Wings & Rings',
      town: 'Oakley Station',
      distance: '0.1 miles',
    };
    const location2: Establishment = {
      id: 1,
      name: 'Buffalo Wings & Rings',
      town: 'Finneytown',
      distance: '7 miles',
    };
    const location3: Establishment = {
      id: 1,
      name: 'Buffalo Wings & Rings',
      town: 'Beechmont',
      distance: '12 miles',
    };
    return of([location1, location2, location3]).pipe(delay(1000));
  }
}
