import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OnboardingComponent } from "./onboarding.component";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

@NgModule({
  declarations: [OnboardingComponent],
  imports: [CommonModule, FormsModule, IonicModule, CommonModule],
  exports: [OnboardingComponent]
})
export class OnboardingModule {}
