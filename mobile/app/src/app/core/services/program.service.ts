import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { Program } from '../../state/program/program.model';
import { delay } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable()
export class ProgramService {
  private url = 'api/programs';
  constructor(private httpClient: HttpClient) {}

  getPrograms(): Observable<Array<Program>> {
    // return this.httpClient.get<Program[]>(this.url);
    const program1: Program = {
      id: 1,
      title: 'Xavier at Georgetown',
      type: 'basketball',
      channel: 206,
      channelTitle: 'FS1',
      start: moment()
        .hour(19)
        .minutes(0)
        .toDate(),
    };
    const program2: Program = {
      id: 1,
      title: 'Florida at Florida State',
      type: 'football',
      channel: 206,
      channelTitle: 'ABC',
      start: moment()
        .hour(20)
        .minutes(0)
        .toDate(),
    };
    const program3: Program = {
      id: 1,
      title: 'West Virginia at Texas',
      type: 'basketball',
      channel: 206,
      channelTitle: 'ESPN2',
      start: moment()
        .hour(20)
        .minutes(0)
        .toDate(),
    };
    const program4: Program = {
      id: 1,
      title: 'Clemson at Wake Forest',
      type: 'basketball',
      channel: 206,
      channelTitle: 'ESPN',
      start: moment()
        .hour(20)
        .minutes(30)
        .toDate(),
    };
    const program5: Program = {
      id: 1,
      title: 'Kansas at Oklahoma',
      type: 'basketball',
      channel: 206,
      channelTitle: 'ESPN',
      start: moment()
        .hour(21)
        .minutes(0)
        .toDate(),
    };
    const program6: Program = {
      id: 1,
      title: 'Cincinnati at Memphis',
      type: 'basketball',
      channel: 206,
      channelTitle: 'CBSSN',
      start: moment()
        .hour(22)
        .minutes(0)
        .toDate(),
    };
    const program7: Program = {
      id: 1,
      title: 'St. Marys at Gonzaga',
      type: 'basketball',
      channel: 206,
      channelTitle: 'ESPNU',
      start: moment()
        .hour(22)
        .minutes(0)
        .toDate(),
    };
    return of([program1, program2, program3, program4, program5, program6, program7]).pipe(delay(500));
  }
}
