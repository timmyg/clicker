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
    reservation.id = "76924ed7-1455-4c96-9aee-da96cff99157";
    return of(reservation);
  }
}
