import { SuggestComponent } from "../suggest/suggest.component";
import { MenuComponent } from "./menu.component";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ReferralPage } from "../referral/referral.page";
import { VoucherComponent } from '../voucher/voucher.component';

@NgModule({
  imports: [SharedModule, CommonModule, FormsModule, IonicModule],
  declarations: [MenuComponent, SuggestComponent, ReferralPage, VoucherComponent],
  providers: [],
  entryComponents: [SuggestComponent, ReferralPage, VoucherComponent],
  exports: [MenuComponent],
})
export class MenuModule {}
