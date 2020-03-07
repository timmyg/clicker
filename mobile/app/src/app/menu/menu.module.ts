
import { SuggestComponent } from "../suggest/suggest.component";
import { MenuComponent } from "./menu.component";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ReferralPage } from "../referral/referral.page";
// import { ReferralPageModule } from "../referral/referral.module";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    // ReferralPageModule,
  ],
  declarations: [
    MenuComponent,
    SuggestComponent,
    ReferralPage
  ],
  providers: [],
  entryComponents: [
    SuggestComponent,
    ReferralPage,
  ],
  exports: [
    MenuComponent,
  ]
})
export class MenuModule {}
