import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MomentModule } from 'ngx-moment';
import { TimeagoModule } from 'ngx-timeago';

@NgModule({
  declarations: [],
  imports: [FontAwesomeModule, MomentModule, TimeagoModule],
  exports: [FontAwesomeModule, MomentModule, TimeagoModule],
})
export class SharedModule { }