import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Location } from "src/app/state/location/location.model";

@Component({
  selector: "app-location",
  templateUrl: "./location.component.html",
  styleUrls: ["./location.component.scss"]
})
export class LocationComponent {
  @Input() location: Location;
  @Input() userLocations: string[];
  @Input() userRoles: string[];
  @Output() onClick = new EventEmitter<Location>();
  @Output() onManage = new EventEmitter<Location>();

  isManager() {
    const { userLocations, userRoles } = this;
    if (userLocations && userRoles) {
      return (
        userLocations.indexOf(this.location.id) > -1 ||
        userRoles.indexOf("superman") > -1
      );
    }
  }

  isAvailable() {
    return this.location.active && this.location.connected;
  }

  onLocationClick() {
    this.onClick.emit(this.location);
  }

  onManageClick(slidingItem) {
    this.onManage.emit(this.location);
    slidingItem.close();
  }

  getDistance() {
    const { distance } = this.location;
    if (distance <= 10) {
      return distance;
    } else if (distance > 10 && distance <= 500) {
      return Math.round(distance);
    } else {
      return "500+";
    }
  }
}
