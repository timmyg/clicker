import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MomentModule } from 'ngx-moment';

@NgModule({
  declarations: [],
  imports: [FontAwesomeModule, MomentModule],
  exports: [FontAwesomeModule, MomentModule],
})
export class SharedModule {}
