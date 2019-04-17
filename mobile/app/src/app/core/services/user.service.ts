import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/state/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private prefix = `users`;
  constructor(private httpClient: HttpClient) {}

  get(): Observable<User> {
    return this.httpClient.get<User>(this.prefix);
  }

  create(user: User): Observable<User> {
    return this.httpClient.post<User>(this.prefix, user);
  }
}
