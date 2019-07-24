import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getReservation } from 'src/app/state/reservation';
import { Reservation } from '../state/reservation/reservation.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ReservationGuard implements CanActivate {
  reservation$: Observable<Partial<Reservation>>;

  constructor(private store: Store<fromStore.AppState>, private router: Router) {
    this.reservation$ = this.store.select(getReservation);
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.reservation$.pipe(
      map(r => {
        const isValidReservation = r && r.location !== undefined;
        if (!isValidReservation) {
          this.router.navigate(['/tabs/reserve']);
        }
        return true;
      }),
    );
  }
}
