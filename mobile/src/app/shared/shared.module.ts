import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletPage } from './wallet/wallet.page';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [WalletPage],
  imports: [CommonModule, IonicModule.forRoot()],
  entryComponents: [WalletPage],
})
export class SharedModule {}
