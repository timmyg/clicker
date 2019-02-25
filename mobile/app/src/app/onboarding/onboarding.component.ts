import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  onboarded: boolean;
  ready: boolean;

  options = {
    effect: 'flip',
  };

  constructor(private storage: Storage) {}

  ngOnInit() {
    console.log('onboarding component');
    this.checkOnboarded();
  }

  checkOnboarded() {
    // TODO this might slow down the apparent opening of the app?
    this.storage.get('onboarded').then(onboarded => {
      this.onboarded = onboarded;
      this.ready = true;
    });
  }

  onGetStarted() {
    this.storage.set('onboarded', true);
    this.onboarded = true;
  }
}
