import { TestBed, async, inject } from '@angular/core/testing';

import { ReservationGuard } from './reservation.guard';

describe('ReservationGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReservationGuard]
    });
  });

  it('should ...', inject([ReservationGuard], (guard: ReservationGuard) => {
    expect(guard).toBeTruthy();
  }));
});
