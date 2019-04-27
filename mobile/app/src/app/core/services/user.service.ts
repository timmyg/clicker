import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/state/user/user.model';
import { Storage } from '@ionic/storage';
import { mergeMap } from 'rxjs/operators';
import * as decode from 'jwt-decode';
import { v4 as uuid } from 'uuid';
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
          return decode(token);
        } else {
          const user: Partial<User> = {
            sub: uuid(),
          };
          // const token = encode(user, 'clicker');
          this.setAnonymous(token);
          return user;
        }
      }),
    );
  }

  set(token: string) {
    this.storage.set(storage.token, token);
  }

  setAnonymous(token: string) {
    this.storage.set(storage.anonymous, token);
  }
}
