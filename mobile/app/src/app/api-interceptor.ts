import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  userId: string;
  constructor(private storage: Storage) {
    // TODO need to subscribe to the cookie or something, and there is a race condition for setting it on initial page load...
    console.error(
      'need to subscribe to the cookie or something, and there is a race condition for setting it on initial page load...',
    );
    this.storage.get('userid').then(userId => {
      this.userId = userId;
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('intercept');
    const apiReq = req.clone({
      url: `${environment.apiBaseUrl}/${req.url}`,
      setHeaders: {
        Authorization: `Bearer ${this.userId}`,
      },
    });

    return next.handle(apiReq);
  }
}
