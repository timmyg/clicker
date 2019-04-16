import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private storage: Storage) {}

  getToken(): Promise<any> {
    return this.storage.get('userid');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.getToken()).pipe(
      mergeMap(token => {
        const apiReq = req.clone({
          url: `${environment.apiBaseUrl}/${req.url}`,
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });

        return next.handle(apiReq);
      }),
    );
  }
}
