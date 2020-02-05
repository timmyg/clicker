import { Injectable } from "@angular/core";

@Injectable()
export class Globals {
  get events() {
    return {
      opened: "Opened",
      rated: "Rated",
      onboarding: {
        completed: "Onboarding Completed"
      },
      reservation: {
        // started: 'Reservation Started',
        created: "Reservation Created",
        updated: "Reservation Updated",
        cancelled: "Reservation Cancelled",
        clickedButton: "Reservation Started: Button",
        clickedLink: "Reservation Started: Link",
        failed: "Reservation Failed",
        selectedLocation: "Reservation Location Selected",
        selectedTV: "Reservation TV Selected",
        selectedProgram: "Reservation Program Selected"
      },
      location: {
        search: "Location Searched",
        listedAll: "Locations Listed"
      },
      program: {
        info: "Program Info Viewed",
        search: "Program Searched"
      },
      tv: {
        reserved: "Clicked Reserved TV"
      },
      login: {
        started: "Login Started",
        completed: "Login Completed"
      },
      payment: {
        sourceAdded: "Payment Source Added",
        fundsAdded: "Funds Added"
      },
      permissions: {
        geolocation: {
          denied: "Permission Geolocation Denied",
          allowed: "Permission Geolocation Allowed"
        }
      }
    };
  }
}

// used outside of app
// 'Control Center Channel Change'
// 'Manual Channel Change'
