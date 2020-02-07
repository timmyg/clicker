import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Actions } from "@ngrx/effects";
import { getDetailsPage, getLoading } from "src/app/state/location";
import { Store } from "@ngrx/store";
import * as fromStore from "src/app/state/app.reducer";
import * as fromLocation from "src/app/state/location/location.actions";
import { ClassGetter } from "@angular/compiler/src/output/output_ast";

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
  ) {
    this.locationDetailHtml$ = this.store.select(getDetailsPage);
    // this.locationDetailHtml$.subscribe(x => {
    //   console.log({x})
    //   this.html = x
    // })
    this.isLoading$ = this.store.select(getLoading);
  }

  ngOnInit() {
    console.log('dispatch')
    this.store.dispatch(
      new fromLocation.GetDetailsPage(this.locationId)
    );
  }
}
