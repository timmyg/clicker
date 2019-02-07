import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletPage } from './wallet/wallet.page';

@NgModule({
  declarations: [WalletPage],
  imports: [CommonModule],
  entryComponents: [WalletPage],
})
export class SharedModule {}
