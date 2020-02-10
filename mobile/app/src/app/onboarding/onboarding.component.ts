import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { Storage } from "@ionic/storage";
import { SegmentService } from "ngx-segment-analytics";
import { Globals } from "../globals";

@Component({
  selector: "app-onboarding",
  templateUrl: "./onboarding.component.html",
  styleUrls: ["./onboarding.component.scss"]
})
export class OnboardingComponent implements OnInit {
  onboarded: boolean;
  ready: boolean;

  options = {
    effect: "flip"
  };

  constructor(
    private storage: Storage,
    private segment: SegmentService,
    private globals: Globals
  ) {}

  ngOnInit() {
    this.checkOnboarded();
  }

  checkOnboarded() {
    // TODO this might slow down the apparent opening of the app?
    this.storage.get("onboarded").then(onboarded => {
      this.onboarded = onboarded;
      this.ready = true;
    });
  }

  onGetStarted() {
    this.storage.set("onboarded", true);
    this.onboarded = true;
    this.segment.track(this.globals.events.onboarding.completed);
  }
}
