import { Injectable } from '@angular/core';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor() {}

  getReservations(): Observable<Array<Reservation>> {
    // return this.httpClient.get<Location[]>(this.url);
    return of();
  }

  createReservation(reservation: Partial<Reservation>): Observable<Partial<Reservation>> {
    // return this.httpClient.get<Location[]>(this.url);
    // TODO remove
    reservation.id = '76924ed7-1455-4c96-9aee-da96cff99157';
    return of(reservation);
  }
}
