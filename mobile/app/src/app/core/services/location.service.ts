import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Location } from '../../state/location/location.model';
import { environment } from 'src/environments/environment';
import { TV } from 'src/app/state/location/tv.model';

@Injectable()
export class LocationService {
  private url = `${environment.apiBaseUrl}/locations`;
  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Location[]> {
    return this.httpClient.get<Location[]>(this.url);
  }

  get(locationId: string): Observable<Location> {
    return this.httpClient.get<Location>(`${this.url}/${locationId}`);
  }
}
