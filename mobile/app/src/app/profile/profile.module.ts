import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { MomentModule } from 'ngx-moment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../shared/shared.module';
import { ReservationComponent } from './reservation/reservation.component';
import { AuthModule } from '../auth/auth.module';
import { LoginComponent } from '../auth/login/login.component';
import { FeatureFlag } from '../directives/feature-flag.directive';
import { WalletModule } from '../wallet/wallet.module';
import { WalletPage } from '../wallet/wallet.page';
import { CoinsComponent } from '../wallet/coins/coins.component';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
];

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    MomentModule,
    WalletModule,
    FontAwesomeModule,
    AuthModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ProfilePage, ReservationComponent, FeatureFlag],
  entryComponents: [LoginComponent, WalletPage, CoinsComponent],
})
export class ProfilePageModule {}
