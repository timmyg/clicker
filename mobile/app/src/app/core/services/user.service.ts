import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/state/user/user.model';
import { Storage } from '@ionic/storage';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private prefix = `users`;
  constructor(private httpClient: HttpClient, private storage: Storage) {}

  get(): Observable<User> {
    console.log('get');
    return from(this.storage.get('userid')).pipe(
      mergeMap(userId => {
        console.log('a', userId);
        if (userId) {
          console.log('b');
          return this.httpClient.get<User>(`${this.prefix}/${userId}`);
        } else {
          console.log('c');
          return this.httpClient.post<User>(this.prefix, {});
        }
      }),
    );
  }

  set(user: User) {
    this.storage.set('userid', user.id);
  }
}
