import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

@Injectable()
export class FeedbackService {
  private prefix = `feedback`;
  constructor(private httpClient: HttpClient) {}

  submit(message: String): Observable<any> {
    return this.httpClient.post<any>(`${this.prefix}`, { message });
  }
}
