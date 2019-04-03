import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { appReducer } from './app.reducer';
import { LocationsEffects } from './location/location.effects';
import { ProgramsEffects } from './program/program.effects';
import { ReservationsEffects } from './reservation/reservation.effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(appReducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
    }),
    EffectsModule.forRoot([LocationsEffects, ProgramsEffects, ReservationsEffects]),
  ],
  declarations: [],
})
export class StateModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: StateModule,
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: StateModule) {
    if (parentModule) {
      throw new Error('StateModule is already loaded. Import it in the AppModule only');
    }
  }
}
