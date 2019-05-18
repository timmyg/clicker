import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { Geolocation } from '../../state/location/geolocation.model';

@Injectable()
export class LocationService {
  private prefix = `locations`;
  constructor(private httpClient: HttpClient) {}

  getAll(geolocation: Geolocation): Observable<Location[]> {
    const { latitude, longitude } = geolocation;
    return this.httpClient.get<Location[]>(`${this.prefix}/${latitude}/${longitude}`);
  }

  get(locationId: string): Observable<Location> {
    return this.httpClient.get<Location>(`${this.prefix}/${locationId}`);
  }
}
