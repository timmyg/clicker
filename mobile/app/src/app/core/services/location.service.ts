import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Location } from '../../state/location/location.model';

@Injectable()
export class LocationService {
  private prefix = `locations`;
  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Location[]> {
    return this.httpClient.get<Location[]>(this.prefix);
  }

  get(locationId: string): Observable<Location> {
    return this.httpClient.get<Location>(`${this.prefix}/${locationId}`);
  }
}
