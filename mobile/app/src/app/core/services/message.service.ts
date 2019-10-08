import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MessageService {
  private prefix = `messages`;
  constructor(private httpClient: HttpClient) {}

  send(): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.prefix}/app`);
  }
}
