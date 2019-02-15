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
      name: 'The Broken Stool',
      town: 'Springfield',
      distance: '0.1 miles',
      img: 'https://www.firstdegreefitness.com/wp-content/uploads/2016/04/cr-logo-login.png',
    };
    const location2: Establishment = {
      id: 1,
      name: "Gaston's",
      town: 'Springfield',
      distance: '0.6 miles',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz5hYLsczjnOjToxnqoKwmrd47V3PJ2pUdOXP0uS9XsJuhaJrw',
    };
    const location3: Establishment = {
      id: 1,
      name: "McGinty's",
      town: 'Cypress Creek',
      distance: '0.7 miles',
      img:
        'https://chickmcgee.fireside.fm/assets/logo/logo-256x256-1b9cff0eaea622bb3cd0ae098de31080dd3e0473f3b2ed285279abc1661f3f16.png',
    };
    const location4: Establishment = {
      id: 1,
      name: 'Spotted Dog ',
      town: 'Cypress Creek',
      distance: '1.3 miles',
      img: 'https://99designs.com/avatars/users/2044615/128',
    };
    const location5: Establishment = {
      id: 1,
      name: 'Essence',
      town: 'North Haverbrook',
      distance: '2.0 miles',
      img: 'https://d13genyhhfmqry.cloudfront.net/widget/mp_2406860_2018-05-15-00-35-26-000296.jpg',
    };
    const location6: Establishment = {
      id: 1,
      name: "Walt's Wings",
      town: 'North Haverbrook',
      distance: '2.2 miles',
      img: 'http://www.bankruptcyattorney.center/wp-content/uploads/2016/11/Barlogo.jpg',
    };
    return of([location1, location2, location3, location4, location5]).pipe(delay(500));
  }
}
