import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReservePage } from './reserve.page';
import { LocationsComponent } from './components/locations/locations.component';
import { GamesComponent } from './components/games/games.component';
import { TvsComponent } from './components/tvs/tvs.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'locations',
    pathMatch: 'full',
  },
  {
    path: 'locations',
    component: LocationsComponent,
  },
  {
    path: 'games',
    component: GamesComponent,
  },
  {
    path: 'tvs',
    component: TvsComponent,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ReservePage, LocationsComponent, GamesComponent, TvsComponent],
})
export class ReservePageModule {}
