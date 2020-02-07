import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

import { Observable } from "rxjs";
import { Location } from "../../state/location/location.model";
import { Geolocation } from "../../state/location/geolocation.model";
import { map } from "rxjs/operators";

@Injectable()
export class LocationService {
  private prefix = `locations`;
  constructor(private httpClient: HttpClient) {}

  getAll(geolocation?: Geolocation, miles?: number): Observable<Location[]> {
    let url = this.prefix;
    const { latitude, longitude } = { ...geolocation };
    let params;
    if (miles) {
      params = new HttpParams().set("miles", miles.toString());
    }
    if (latitude && longitude) {
      url += `/geo/${latitude}/${longitude}`;
    }
    return this.httpClient.get<Location[]>(url, { params });
  }

  getDetails(locationId: string): Observable<string> {
    return this.httpClient.get<Response>(`${this.prefix}/${locationId}/details/page`).pipe(map(response => {
      console.log('response2', response)
      // const data = response.json();
      // console.log(data)
      // console.log({data})
      return response['html'];
      // return ''
    }))
  }


  get(
    locationId: string,
    latitude: number,
    longitude: number
  ): Observable<Location> {
    return this.httpClient.get<Location>(
      `${this.prefix}/${locationId}?latitude=${latitude}&longitude=${longitude}`
    );
  }

  turnOn(locationId: string, autotune: boolean): Observable<any> {
    return this.httpClient.post<Location>(
      `${this.prefix}/${locationId}/boxes/on`,
      { autotune }
    );
  }

  turnOff(locationId: string): Observable<any> {
    return this.httpClient.post<Location>(
      `${this.prefix}/${locationId}/boxes/off`,
      {}
    );
  }
}
