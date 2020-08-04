import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Location } from "src/app/state/location/location.model";
import { filter } from "rxjs/operators";
import { ToastController } from '@ionic/angular';

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

  constructor(private toastController: ToastController) {
    this.toastController = toastController;
  }

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

  isAvailable() {
    return this.location.active && this.location.connected;
  }

  onLocationClick() {
    console.log(this.location.vipOnly,!this.isVip);
    if (this.location.vipOnly && !this.isVip && !this.isManager) {
      return this.showVipOnlyToast();
    }
    this.onClick.emit({location: this.location, isManager: this.isManager, isVip: this.isVip});
  }

  private async showVipOnlyToast() {
    const success = await this.toastController.create({
      message: `${this.location.name} is VIP Only. Ask the staff about becoming a VIP so you can change the channel!`,
      duration: 8000,
      cssClass: "ion-text-center",
      // color: "warning"
    });
    success.present();
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
