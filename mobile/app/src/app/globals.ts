import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  get events() {
    return {
      opened: 'Opened',
      rated: 'Rated',
      onboarding: {
        completed: 'Onboarding Completed',
      },
      reservation: {
        started: 'Reservation Started',
        created: 'Reservation Created',
        updated: 'Reservation Updated',
        cancelled: 'Reservation Cancelled',
        clickedButton: 'Reservation Started: Button',
        clickedLink: 'Reservation Started: Link',
        failed: 'Reservation Failed',
        selectedLocation: 'Reservation Location Selected',
        selectedTV: 'Reservation TV Selected',
        selectedChannel: 'Reservation Channel Selected',
        selectedProgram: 'Reservation Program Selected',
        selectedTimeframe: 'Reservation Timeframe Selected',
      },
      location: {
        search: 'Location Searched',
      },
      program: {
        info: 'Program Info Viewed',
        search: 'Program Searched',
      },
      tv: {
        reserved: 'Clicked Reserved TV',
      },
      login: {
        started: 'Login Started',
        completed: 'Login Completed',
      },
      payment: {
        sourceAdded: 'Payment Source Added',
        fundsAdded: 'Funds Added',
      },
      permissions: {
        geolocation: {
          denied: 'Permission Geolocation Denied',
          allowed: 'Permission Geolocation Allowed',
        },
      },
    };
  }
}
