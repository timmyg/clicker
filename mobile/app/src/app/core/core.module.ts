import {
  NgModule,
  ModuleWithProviders,
  Optional,
  SkipSelf
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { LocationService } from "./services/location.service";
import { ProgramService } from "./services/program.service";
import { ReservationService } from "./services/reservation.service";
import { MessageService } from "./services/message.service";
import { IonicStorageModule } from "@ionic/storage";
import { AppService } from "./services/app.service";

@NgModule({
  declarations: [],

  imports: [CommonModule, HttpClientModule, IonicStorageModule.forRoot()],
  providers: [
    AppService,
    LocationService,
    ProgramService,
    ReservationService,
    MessageService
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }

  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error(
        "CoreModule is already loaded. Import it in the AppModule only"
      );
    }
  }
}
