import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { NgxStripeModule } from 'ngx-stripe';

import { ProfilePage } from './profile.page';
import { MomentModule } from 'ngx-moment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { WalletPage } from './wallet/wallet.page';
import { SharedModule } from '../shared/shared.module';
import { ReservationComponent } from './reservation/reservation.component';
import { FeedbackPage } from './feedback/feedback.page';
import { AuthModule } from '../auth/auth.module';
import { LoginComponent } from '../auth/login/login.component';
import { LoggingInComponent } from './logging-in.component';
import { environment } from 'src/environments/environment';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'logging-in',
    component: LoggingInComponent,
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
    ReactiveFormsModule,
    NgxStripeModule.forRoot(environment.stripe.publishableKey),
    RouterModule.forChild(routes),
  ],
  declarations: [ProfilePage, WalletPage, FeedbackPage, ReservationComponent, LoggingInComponent],
  entryComponents: [WalletPage, FeedbackPage, LoginComponent],
})
export class ProfilePageModule {}
