import { Injectable } from "@angular/core";
import { Observable, from, of, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Storage } from "@ionic/storage";
import { mergeMap, map } from "rxjs/operators";
const storage = {
  darkMode: "darkMode",
  token: "token",
  originalToken: "originalToken",
  anonymous: "anonymous"
};

import { Plan } from "src/app/state/app/plan.model";

@Injectable({
  providedIn: "root"
})
export class UserService {
  private prefix = `users`;
  public isDarkMode$: Subject<boolean> = new Subject<boolean>();
  constructor(private httpClient: HttpClient, private storage: Storage) {
    this.initTheme()
  }

  loginVerifyStart(phone: string): Observable<boolean> {
    return this.httpClient.post<any>(`${this.prefix}/verify/start`, { phone });
  }

  loginVerify(phone, code: string, uuid: string): Observable<string> {
    return this.httpClient
      .post<any>(`${this.prefix}/verify`, { phone, code, uuid })
      .pipe(map(result => result.token));
  }

  async setDarkMode(isDarkMode: boolean) {
    await this.storage.set(storage.darkMode, isDarkMode)
    this.isDarkMode$.next(isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
  }

  async initTheme() {
    let isDarkMode = await this.storage.get(storage.darkMode);
    if (isDarkMode === null) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode = prefersDark;
    }
    await this.setDarkMode(isDarkMode)
  }

  get(): Observable<string> {
    return from(this.storage.get(storage.token)).pipe(
      mergeMap(token => {
        // console.log({token});
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
      })
    );
  }

  getWallet(): Observable<Number> {
    return this.httpClient.get<any>(`${this.prefix}/wallet`, {});
  }

  alias(fromId: string, toId: string): Observable<any> {
    return this.httpClient.post<any>(
      `${this.prefix}/alias/${fromId}/${toId}`,
      {}
    );
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

  addReferral(code: string): Observable<any> {
    return this.httpClient.post<any>(`${this.prefix}/referral`, { code });
  }

  async setToken(token: string) {
    return await this.storage.set(storage.token, token);
  }

  setOriginalToken(token: string) {
    this.storage.set(storage.originalToken, token);
  }
}
