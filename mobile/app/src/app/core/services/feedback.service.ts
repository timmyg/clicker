import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class FeedbackService {
  private url = 'api/feedback';
  constructor(private httpClient: HttpClient) {}

  submit(text: String): Observable<any> {
    // return this.httpClient.get<Program[]>(this.url);
    return of('').pipe(delay(500));
  }
}
