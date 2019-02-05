import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReservePage } from './reserve.page';
import { LocationsComponent } from './presentation/locations/locations.component';
import { GamesComponent } from './presentation/games/games.component';
import { TvsComponent } from './presentation/tvs/tvs.component';

const routes: Routes = [
  {
    path: '',
    component: ReservePage,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [ReservePage, LocationsComponent, GamesComponent, TvsComponent],
})
export class ReservePageModule {}
