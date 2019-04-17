import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs.router.module';

import { TabsPage } from './tabs.page';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { AuthPageModule } from '../auth/auth.module';
import { AuthPage } from '../auth/auth.page';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, TabsPageRoutingModule, OnboardingModule, AuthPageModule],
  declarations: [TabsPage],
  entryComponents: [AuthPage],
})
export class TabsPageModule {}
