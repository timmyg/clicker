import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class MessageService {
  private prefix = `notifications`;
  constructor(private httpClient: HttpClient) {}

  send(text: string): Observable<boolean> {
    return this.httpClient.post<boolean>(`${this.prefix}/app`, { text });
  }
}
