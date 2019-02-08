import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs.router.module';

import { TabsPage } from './tabs.page';
import { OnboardingModule } from '../onboarding/onboarding.module';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, TabsPageRoutingModule, OnboardingModule],
  declarations: [TabsPage],
})
export class TabsPageModule {
  // showOnboarding: boolean;
  // onShowOnboarding() {
  //   console.log('oso');
  //   this.showOnboarding = true;
  // }
}
