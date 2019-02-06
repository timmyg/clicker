import { Injectable } from '@angular/core';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor() {}

  getReservations(): Observable<Array<Reservation>> {
    // return this.httpClient.get<Establishment[]>(this.url);
    return of();
  }

  createReservation(reservation: Reservation): Observable<Reservation> {
    // return this.httpClient.get<Establishment[]>(this.url);
    return of(reservation);
  }
}
