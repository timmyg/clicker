import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Location } from "src/app/state/location/location.model";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-location",
  templateUrl: "./location.component.html",
  styleUrls: ["./location.component.scss"],
})
export class LocationComponent {
  @Input() location: Location;
  @Input() userLocations: string[];
  @Input() userRoles: any;
  @Output() onClick = new EventEmitter<{location: Location, isManager: boolean, isVip: boolean}>();
  @Output() onManage = new EventEmitter<Location>();
  @Output() onLocationDetail = new EventEmitter<Location>();
  isManager: boolean;
  isVip: boolean;

  ngOnInit() {
    this.userRoles.pipe(filter((roles) => !!roles)).subscribe((roles) => {
      const manageLocations = roles["manageLocations"];
      this.isManager =
        manageLocations && manageLocations.includes(this.location.id);
      const vipLocations = roles["vipLocations"];
      this.isVip =
        vipLocations && vipLocations.includes(this.location.id);
    });
  }

  // isManager() {
  //   // const {  userRoles } = this;
  //   // console.log(userRoles);
  //   // if (userLocations && userRoles) {
  //   //   return (
  //   //     userLocations.indexOf(this.location.id) > -1 ||
  //   //     userRoles.indexOf("superman") > -1
  //   //   );
  //   // }
  // }

  isAvailable() {
    return this.location.active && this.location.connected;
  }

  onLocationClick() {
    this.onClick.emit({location: this.location, isManager: this.isManager, isVip: this.isVip});
  }

  onManageClick(slidingItem) {
    this.onManage.emit(this.location);
    slidingItem.close();
  }

  onInfoClick(slidingItem) {
    this.onLocationDetail.emit(this.location);
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
