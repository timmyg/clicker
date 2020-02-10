import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { getDetailsPage, getDetailsLoading } from "src/app/state/location";
import { Store } from "@ngrx/store";
import * as fromStore from "src/app/state/app.reducer";
import * as fromLocation from "src/app/state/location/location.actions";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-location-detail",
  templateUrl: "./location-detail.page.html",
  styleUrls: ["./location-detail.page.scss"]
})
export class LocationDetailPage {
  locationDetailHtml$: Observable<string>;
  html: string;
  isLoading$: Observable<boolean>;
  @Input() locationId: string;

  constructor(
    private store: Store<fromStore.AppState>,
    public modalController: ModalController,
  ) {
    this.locationDetailHtml$ = this.store.select(getDetailsPage);
    this.isLoading$ = this.store.select(getDetailsLoading);
  }

  ngOnInit() {
    this.store.dispatch(
      new fromLocation.GetDetailsPage(this.locationId)
    );
  }

  onCloseClick() {
    this.modalController.dismiss();
  }
}
