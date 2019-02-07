import { Component, Output, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
  @Output() onboarded = new EventEmitter();
  options = {
    effect: 'flip',
  };

  constructor(private storage: Storage) {}

  onGetStarted() {
    this.storage.set('onboarded', true);
    this.onboarded.emit(null);
  }
}
