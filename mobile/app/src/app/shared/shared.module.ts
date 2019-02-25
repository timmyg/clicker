import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletPage } from './wallet/wallet.page';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from '../core/core.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [WalletPage],
  imports: [CommonModule, IonicModule.forRoot(), FontAwesomeModule],
  entryComponents: [WalletPage],
})
export class SharedModule {}
