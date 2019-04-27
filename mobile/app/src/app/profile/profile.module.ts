import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { MomentModule } from 'ngx-moment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { WalletPage } from './wallet/wallet.page';
import { SharedModule } from '../shared/shared.module';
import { ReservationComponent } from './reservation/reservation.component';
import { FeedbackPage } from './feedback/feedback.page';
import { AuthModule } from '../auth/auth.module';
import { LoginComponent } from '../auth/login/login.component';

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
    FontAwesomeModule,
    AuthModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ProfilePage, WalletPage, FeedbackPage, ReservationComponent],
  entryComponents: [WalletPage, FeedbackPage, LoginComponent],
})
export class ProfilePageModule {}
