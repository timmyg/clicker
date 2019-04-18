import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { mergeMap, first } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';
import { Store, select } from '@ngrx/store';
import * as fromUser from './state/user/user.reducer';
import { User } from './state/user/user.model';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private store$: Store<any>) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.addToken(request).pipe(
      first(),
      mergeMap((requestWithToken: HttpRequest<any>) => next.handle(requestWithToken)),
    );
  }

  /**
   * Adds the JWT token to the request's header.
   */
  private addToken(request: HttpRequest<any>): Observable<HttpRequest<any>> {
    console.log('add token', request);
    // skip if initial user creation
    if (request.url.split('/')[0] === 'users') {
      return of(
        request.clone({
          url: `${environment.apiBaseUrl}/${request.url}`,
        }),
      );
    }
    return this.store$.pipe(
      select(fromUser.getUser),
      first(),
      mergeMap((user: User) => {
        if (user.id) {
          request = request.clone({
            url: `${environment.apiBaseUrl}/${request.url}`,
            headers: request.headers.set('Authorization', `Bearer ${user.id}`),
          });
        } else {
          console.warn(`Invalid id!!! Cannot use id "${user.id}".`);
        }
        return of(request);
      }),
    );
  }
}
