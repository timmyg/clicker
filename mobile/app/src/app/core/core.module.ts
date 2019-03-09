import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LocationService } from './services/location.service';
import { ProgramService } from './services/program.service';
import { TvService } from './services/tv.service';
import { ReservationService } from './services/reservation.service';
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [],

  imports: [CommonModule, HttpClientModule, IonicStorageModule.forRoot()],
  providers: [LocationService, ProgramService, TvService, ReservationService],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
    };
  }

  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule,
  ) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
