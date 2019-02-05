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
      name: 'Buffalo Wings & Rings: Oakley',
    };
    return of([location1]).pipe(delay(1000));
  }
}
