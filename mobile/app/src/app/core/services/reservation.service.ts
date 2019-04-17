import { Injectable } from '@angular/core';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ReservationService {
  private prefix = `reservations`;
  constructor(private httpClient: HttpClient) {}

  getActive(): Observable<Array<Reservation>> {
    return this.httpClient.get<Reservation[]>(`${this.prefix}/active`);
  }

  get(reservation: Reservation): Observable<Array<Reservation>> {
    return this.httpClient.get<Reservation[]>(`${this.prefix}/${reservation.id}`);
  }

  create(reservation: Partial<Reservation>): Observable<Reservation> {
    return this.httpClient.post<Reservation>(`${this.prefix}`, reservation);
  }

  update(reservation: Partial<Reservation>): Observable<Reservation> {
    return this.httpClient.put<Reservation>(`${this.prefix}/${reservation.id}`, reservation);
  }

  cancel(reservation: Partial<Reservation>): Observable<Reservation> {
    return this.httpClient.delete<Reservation>(`${this.prefix}/${reservation.id}`);
  }
}
