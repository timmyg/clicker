import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletPage } from './wallet.page';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgxStripeModule } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { CoinsComponent } from './coins/coins.component';

@NgModule({
  declarations: [WalletPage, CoinsComponent],
  imports: [CommonModule, IonicModule, FormsModule, NgxStripeModule.forRoot(environment.stripe.publishableKey)],
  exports: [CoinsComponent],
  providers: [WalletPage, CoinsComponent],
})
export class WalletModule {}
