import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { User } from 'src/app/state/user/user.model';
import { Storage } from '@ionic/storage';
import { mergeMap } from 'rxjs/operators';
// import * as decode from 'jwt-decode';
const storage = {
  token: 'token',
  anonymous: 'anonymous',
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private prefix = `users`;
  constructor(private httpClient: HttpClient, private storage: Storage) {}

  get(): Observable<string> {
    return from(this.storage.get(storage.token)).pipe(
      mergeMap(token => {
        console.log({ token });
        if (token) {
          return of(token);
        } else {
          return new Observable(observer => {
            this.httpClient.post<any>(this.prefix, {}).subscribe(result => {
              console.log({ result });
              this.set(result.token);
              return observer.next(result.token);
            });
          });
        }
      }),
    );
  }

  getWallet(): Observable<Number> {
    return new Observable(observer => {
      this.httpClient.get<any>(`${this.prefix}/wallet`, {}).subscribe(result => {
        return observer.next(result.tokens);
      });
    });
  }

  alias(fromId: string, toId: string): Observable<any> {
    return this.httpClient.get<any>(`${this.prefix}/alias/${fromId}/${toId}`, {});
  }

  set(token: string) {
    this.storage.set(storage.token, token);
  }
}
