import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { User } from 'src/app/state/user/user.model';
import { Storage } from '@ionic/storage';
import { mergeMap } from 'rxjs/operators';
// import * as decode from 'jwt-decode';
const storage = {
  token: 'token',
  originalToken: 'originalToken',
  anonymous: 'anonymous',
};

import auth0 from 'auth0-js';
import { environment } from 'src/environments/environment';
import { Plan } from 'src/app/state/app/plan.model';

const auth = new auth0.WebAuth({
  domain: environment.auth0.domain,
  clientID: environment.auth0.clientId,
  responseType: 'token id_token',
  redirectUri: window.location.origin + '/silent',
});

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private prefix = `users`;
  constructor(private httpClient: HttpClient, private storage: Storage) {}

  // refresh(): Observable<any> {
  //   return new Observable(observer => {
  //     auth.checkSession({}, async (err, result) => {
  //       if (result) {
  //         await this.setToken(result.idToken);
  //       } else {
  //         console.error(err);
  //       }
  //       observer.next();
  //     });
  //   });
  // }

  loginVerifyStart(phone: string): Observable<boolean> {
    return this.httpClient.post<any>(`${this.prefix}/verify/start`, { phone });
  }

  loginVerify(phone, code: string): Observable<boolean> {
    return this.httpClient.post<any>(`${this.prefix}/verify`, { phone, code });
  }

  get(): Observable<string> {
    return from(this.storage.get(storage.token)).pipe(
      mergeMap(token => {
        if (token) {
          return of(token);
        } else {
          return new Observable(observer => {
            this.httpClient.post<any>(this.prefix, {}).subscribe(result => {
              this.setOriginalToken(result.token);
              this.setToken(result.token);
              return observer.next(result.token);
            });
          });
        }
      }),
    );
  }

  getWallet(): Observable<Number> {
    return this.httpClient.get<any>(`${this.prefix}/wallet`, {});
  }

  alias(fromId: string, toId: string): Observable<any> {
    return this.httpClient.post<any>(`${this.prefix}/alias/${fromId}/${toId}`, {});
  }

  updateCard(token: string): Observable<any> {
    return this.httpClient.post<any>(`${this.prefix}/stripe/card`, { token });
  }

  removeCard(): Observable<any> {
    return this.httpClient.delete<any>(`${this.prefix}/stripe/card`);
  }

  addFunds(plan: Plan): Observable<any> {
    return this.httpClient.post<any>(`${this.prefix}/replenish`, plan);
  }

  async setToken(token: string) {
    return await this.storage.set(storage.token, token);
  }

  setOriginalToken(token: string) {
    this.storage.set(storage.originalToken, token);
  }
}
