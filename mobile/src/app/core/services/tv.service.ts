import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { TV } from '../../state/tv/tv.model';
import { delay } from 'rxjs/operators';

@Injectable()
export class TvService {
  private url = 'api/tvs';
  constructor(private httpClient: HttpClient) {}

  getTvs(): Observable<Array<TV>> {
    // return this.httpClient.get<TV[]>(this.url);
    const tv1: TV = {
      id: 1,
      tag: '1',
    };
    const tv2: TV = {
      id: 1,
      tag: '2',
    };
    const tv3: TV = {
      id: 1,
      tag: '3',
      reserved: true,
    };
    const tv4: TV = {
      id: 1,
      tag: '4',
      reserved: true,
    };
    const tv5: TV = {
      id: 1,
      tag: '5',
    };
    const tv6: TV = {
      id: 1,
      tag: '6',
      reserved: true,
    };
    const tv7: TV = {
      id: 1,
      tag: '7',
    };
    const tv8: TV = {
      id: 1,
      tag: '8',
      reserved: true,
    };
    const tv9: TV = {
      id: 1,
      tag: '9',
    };
    const tv10: TV = {
      id: 1,
      tag: '10',
      reserved: true,
    };
    const tv11: TV = {
      id: 1,
      tag: '11',
    };
    const tv12: TV = {
      id: 1,
      tag: '12',
      reserved: true,
    };
    const tv13: TV = {
      id: 1,
      tag: '13',
    };
    const tv14: TV = {
      id: 1,
      tag: '14',
      reserved: true,
    };
    const tv15: TV = {
      id: 1,
      tag: '15',
    };
    const tv16: TV = {
      id: 1,
      tag: '16',
      reserved: true,
    };
    const tv17: TV = {
      id: 1,
      tag: '17',
    };
    const tv18: TV = {
      id: 1,
      tag: '18',
      reserved: true,
    };
    const tv19: TV = {
      id: 1,
      tag: '19',
    };
    const tv20: TV = {
      id: 1,
      tag: '20',
      reserved: true,
    };
    const tv21: TV = {
      id: 1,
      tag: '21',
    };
    const tv22: TV = {
      id: 1,
      tag: '22',
      reserved: true,
    };
    const tv23: TV = {
      id: 1,
      tag: '23',
    };
    const tv24: TV = {
      id: 1,
      tag: '24',
      reserved: true,
    };
    const tv25: TV = {
      id: 1,
      tag: '25',
    };
    const tv26: TV = {
      id: 1,
      tag: '26',
      reserved: true,
    };
    const tv27: TV = {
      id: 1,
      tag: '27',
    };
    const tv28: TV = {
      id: 1,
      tag: '28',
      reserved: true,
    };
    const tv29: TV = {
      id: 1,
      tag: '29',
    };
    const tv30: TV = {
      id: 1,
      tag: '30',
      reserved: true,
    };
    const tv31: TV = {
      id: 1,
      tag: '31',
    };
    const tv32: TV = {
      id: 1,
      tag: '32',
      reserved: true,
    };
    const tv33: TV = {
      id: 1,
      tag: '33',
    };
    const tv34: TV = {
      id: 1,
      tag: '34',
      reserved: true,
    };
    const tv35: TV = {
      id: 1,
      tag: '35',
    };
    const tv36: TV = {
      id: 1,
      tag: '36',
    };
    return of([
      tv1,
      tv2,
      tv3,
      tv4,
      tv5,
      tv6,
      tv7,
      tv8,
      tv9,
      tv10,
      tv11,
      tv12,
      tv13,
      tv14,
      tv15,
      tv16,
      tv17,
      tv18,
      tv19,
      tv20,
      tv21,
      tv22,
      tv23,
      tv24,
      tv25,
      tv26,
      tv27,
      tv28,
      tv29,
      tv30,
      tv31,
      tv32,
      tv33,
      tv34,
      tv35,
      tv36,
    ]).pipe(delay(1000));
  }
}
