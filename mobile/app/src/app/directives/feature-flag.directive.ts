import { Directive, ElementRef, Input, OnInit, Renderer2 } from "@angular/core";
import { Store } from "@ngrx/store";
import { getUser } from "../state/user";
import * as fromStore from "../state/app.reducer";
import { User } from "../state/user/user.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Directive({
  selector: "[feature], [featureOff]"
})
export class FeatureFlag implements OnInit {
  @Input("featureOff") featureNameOff: any;
  @Input("feature") featureNameOn: any;
  user$: Observable<User>;

  constructor(
    private renderer: Renderer2,
    private store: Store<fromStore.AppState>,
    private el: ElementRef
  ) {
    this.user$ = this.store.select(getUser);
  }

  ngOnInit() {
    this.user$.subscribe(u => {
      const roles = u["https://mobile.tryclicker.com/roles"];

      const element = this.el.nativeElement;
      if (this.featureNameOn) {
        if (!roles.includes(this.featureNameOn)) {
          this.renderer.addClass(element, "hide");
        } else {
          this.renderer.removeClass(element, "hide");
        }
      } else if (this.featureNameOff) {
        if (roles.includes(this.featureNameOff)) {
          this.renderer.addClass(element, "hide");
        } else {
          this.renderer.removeClass(element, "hide");
        }
      }
    });
  }
}
