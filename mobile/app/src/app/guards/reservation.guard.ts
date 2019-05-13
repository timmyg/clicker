import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getReservation } from 'src/app/state/reservation';
import { Reservation } from '../state/reservation/reservation.model';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ReservationGuard implements CanActivate {
  reservation$: Observable<Partial<Reservation>>;

  constructor(private store: Store<fromStore.AppState>, private router: Router) {
    this.reservation$ = this.store.select(getReservation);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.reservation$.pipe(
      take(1),
      map(r => {
        const isValidReservation = r && r.location !== null;
        if (!isValidReservation) {
          console.info('bad reservation, starting over');
          this.router.navigate(['/tabs/reserve']);
        }
        return isValidReservation;
      }),
    );
  }
}
