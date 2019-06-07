import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { mergeMap, first, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Store, select } from '@ngrx/store';
import { getUserAuthToken } from './state/user';
import { getPartner } from './state/app';

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
    if (request.url === 'users' && request.method === 'POST') {
      return of(
        request.clone({
          url: `${environment.apiBaseUrl}/${request.url}`,
        }),
      );
    }
    // return this.store$.pipe(
    //   select(getUserAuthToken),
    //   filter(authToken => authToken && authToken.length > 0),
    //   mergeMap((authToken: string) => {
    //     if (authToken) {
    //       request = request.clone({
    //         url: `${environment.apiBaseUrl}/${request.url}`,
    //         headers: request.headers.set('Authorization', `Bearer ${authToken}`),
    //       });
    //     } else {
    //       console.warn(`Bad Token: ${authToken}`);
    //     }
    //     return of(request);
    //   }),
    // );
    return Observable.create(observer => {
      const authToken$ = this.store$.pipe(select(getUserAuthToken));
      const partner$ = this.store$.pipe(select(getPartner));
      combineLatest(authToken$, partner$).subscribe(([authToken, partner]) => {
        console.log('hi');
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('Authorization', `Bearer ${authToken}`);
        headers = headers.append('partner', partner);
        request = request.clone({
          url: `${environment.apiBaseUrl}/${request.url}`,
          // headers,
          headers,
        });
        console.log(request);
        observer.next(request);
        observer.complete();
      });
    });
  }
}
