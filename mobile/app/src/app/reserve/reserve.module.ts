import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReservePage } from './reserve.page';
import { LocationsComponent } from './components/locations/locations.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { TvsComponent } from './components/tvs/tvs.component';
import { MomentModule } from 'ngx-moment';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: ReservePage,
    children: [
      {
        path: 'locations',
        component: LocationsComponent,
      },
      {
        path: 'programs',
        component: ProgramsComponent,
      },
      {
        path: 'tvs',
        component: TvsComponent,
      },
      {
        path: 'confirmation',
        component: ConfirmationComponent,
      },
    ],
  },
  // {
  //   path: '',
  //   redirectTo: 'locations',
  //   pathMatch: 'full',
  // },
];

@NgModule({
  imports: [SharedModule, CommonModule, FormsModule, IonicModule, MomentModule, RouterModule.forChild(routes)],
  declarations: [ReservePage, LocationsComponent, ProgramsComponent, TvsComponent, ConfirmationComponent],
  exports: [TvsComponent],
})
export class ReservePageModule {}
