import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  get events() {
    return {
      opened: 'Opened',
      onboarding: {
        completed: 'Onboarding Completed',
      },
      reservation: {
        started: 'Reservation Started',
        created: 'Reservation Created',
        updated: 'Reservation Updated',
        cancelled: 'Reservation Cancelled',
      },
      login: {
        started: 'Login Started',
        completed: 'Login Completed',
      },
      payment: {
        sourceAdded: 'Payment Source Added',
        fundsAdded: 'Funds Added',
      },
    };
  }
}
