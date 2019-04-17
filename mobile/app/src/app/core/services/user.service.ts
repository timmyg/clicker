import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/state/user/user.model';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private prefix = `users`;
  constructor(private httpClient: HttpClient, private storage: Storage) {}

  get(): Observable<User> {
    return this.httpClient.get<User>(this.prefix);
  }

  create(): Observable<User> {
    return this.httpClient.post<User>(this.prefix, {});
  }

  set(user: User) {
    this.storage.set('userid', user.id);
  }
}
