import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/state/user/user.model';
import { Storage } from '@ionic/storage';
import { mergeMap } from 'rxjs/operators';
import * as decode from 'jwt-decode';
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

  get(): Observable<Partial<User>> {
    return from(this.storage.get(storage.token)).pipe(
      mergeMap(token => {
        if (token) {
          return of(decode(token));
        } else {
          return new Observable(observer => {
            this.httpClient.post<any>(this.prefix, {}).subscribe(result => {
              this.set(result.token);
              return observer.next(decode(result.token));
            });
          });
        }
      }),
    );
  }

  set(token: string) {
    this.storage.set(storage.token, token);
  }
}
