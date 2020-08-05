import { UserService } from "src/app/core/services/user.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import {StripeService} from "ngx-stripe"
import {
  StripeElements,
  StripeCardElement,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { FormGroup } from "@angular/forms";
import {
  ToastController,
  ModalController,
  AlertController,
} from "@ionic/angular";
import * as fromApp from "../state/app/app.actions";
import * as fromUser from "../state/user/user.actions";
import { Store } from "@ngrx/store";
import * as fromStore from "../state/app.reducer";
import { Observable } from "rxjs";
import { Card } from "src/app/state/user/card.model";
import { getUserCard, getUserId } from "src/app/state/user";
import { getLoading, getPlans, getIsDarkMode } from "src/app/state/app";
import { getUserTokenCount } from "../state/user";
import { SegmentService } from "ngx-segment-analytics";
import { Globals } from "../globals";
import { Plan } from "../state/app/plan.model";
import { first, take } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.page.html",
  styleUrls: ["./wallet.page.scss"],
})
export class WalletPage implements OnInit, OnDestroy {
  elements: StripeElements;
  card: StripeCardElement;
  userCard$: Observable<Card>;
  plans$: Observable<Plan[]>;
  isLoading$: Observable<boolean>;
  waiting: boolean;
  addCardMode = false;

  elementsOptions: StripeElementsOptions = {
    locale: "en",
  };

  selectedPlan: Plan;
  stripeFormGroup: FormGroup;
  isDarkMode$: Observable<boolean>;

  constructor(
    private store: Store<fromStore.AppState>,
    private toastController: ToastController,
    private stripeService: StripeService,
    private modalController: ModalController,
    public alertController: AlertController,
    private segment: SegmentService,
    private globals: Globals,
    private actions$: Actions,
    public userService: UserService
  ) {
    this.userCard$ = this.store.select(getUserCard);
    this.plans$ = this.store.select(getPlans);
    this.isLoading$ = this.store.select(getLoading);
    this.isDarkMode$ = this.store.select(getIsDarkMode);
  }

  ngOnInit() {
    this.store.dispatch(new fromApp.LoadPlans());
    this.initStripe();
  }

  ngOnDestroy() {
    // clear timeframes because it messes up the radio buttons when reloading
    this.store.dispatch(new fromApp.ClearPlans());
    console.log("destroy");
    // this.elements.forEach((element) => {
    //   element.destroy();
    // });
    this.card.destroy();
  }

  private initStripe() {
    console.log("initstripe");
    this.stripeService.elements(this.elementsOptions).subscribe((elements) => {
      this.elements = elements;
      // Only mount the element the first time

      if (!this.card) {
        this.isDarkMode$.subscribe((isDarkMode) => {
          const style = {
            base: {
              fontSize: "18px",
            },
          };
          if (isDarkMode) {
            style.base["color"] = "white";
          }
          this.card = this.elements.create("card", { style });
          this.card.mount("#card-element");
        });
      }
    });
  }

  addCard() {
    this.waiting = true;
    this.stripeService.createToken(this.card, {}).subscribe(async (result) => {
      if (result.token) {
        // Use the token to create a charge or a customer
        // https://stripe.com/docs/charges
        this.store.dispatch(new fromUser.UpdateCard(result.token.id));

        this.actions$
          .pipe(
            ofType(fromUser.UPDATE_CARD_SUCCESS),
            take(1)
          )
          .subscribe(async () => {
            const toast = await this.toastController.create({
              message: `💳 Card successfully added. 👐`,
              duration: 3000,
              cssClass: "ion-text-center",
            });
            toast.present();
            this.addCardMode = false;
            this.waiting = false;
            this.segment.track(this.globals.events.payment.sourceAdded, {
              type: "Credit Card",
            });
          });
        this.actions$
          .pipe(ofType(fromUser.UPDATE_CARD_FAIL))
          .pipe(first())
          .subscribe(async (error: any) => {
            const whoops = await this.toastController.create({
              message: error.payload.error.message,
              color: "danger",
              duration: 4000,
              cssClass: "ion-text-center",
            });
            whoops.present();
            this.waiting = false;
          });
      } else if (result.error) {
        // Error creating the token
        console.error(result.error.message);
        const toast = await this.toastController.create({
          message: result.error.message,
          duration: 3000,
          color: "danger",
          cssClass: "ion-text-center",
        });
        toast.present();
        this.waiting = false;
      }
    });
  }

  async purchase() {
    this.waiting = true;
    this.store.dispatch(new fromUser.AddFunds(this.selectedPlan));

    this.actions$
      .pipe(
        ofType(fromUser.ADD_FUNDS_SUCCESS),
        take(1)
      )
      .subscribe(async () => {
        this.waiting = false;
        const toast = await this.toastController.create({
          message: `💰 Successfully purchased ${
            this.selectedPlan.tokens
          } tokens. 🎉`,
          duration: 3000,
          cssClass: "ion-text-center",
        });
        toast.present();
        this.onClose();
        this.segment.track(this.globals.events.payment.fundsAdded, {
          amount: this.selectedPlan.dollars,
        });
        this.store
          .select(getUserId)
          .pipe(first((val) => !!val))
          .subscribe(async (userId) => {
            this.segment.identify(
              userId,
              { paid: true },
              {
                // Intercom: { hideDefaultLauncher: true },
              }
            );
          });
      });
    this.actions$
      .pipe(ofType(fromUser.ADD_FUNDS_FAIL))
      .pipe(first())
      .subscribe(async (err: fromUser.AddFundsFail) => {
        console.error("add funds failed", err.payload.error.message);
        this.waiting = false;
        const toast = await this.toastController.create({
          color: "danger",
          message: err.payload.error.message,
          duration: 3000,
          cssClass: "ion-text-center",
        });
        toast.present();
      });
  }

  async onAmountChange(e) {
    this.selectedPlan = e.detail.value;
  }

  onClose() {
    this.modalController.dismiss();
  }

  goToAddCard() {
    this.addCardMode = true;
  }

  async removeCard() {
    const alert = await this.alertController.create({
      header: "Are you sure?",
      message: "You will need to add a new credit card to purchase tokens.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Remove Card",
          role: "destructive",
          cssClass: "secondary",
          handler: async () => {
            this.waiting = true;
            this.store.dispatch(new fromUser.DeleteCard());
            setTimeout(async () => {
              const toast = await this.toastController.create({
                message: `Card removed. 👍`,
                duration: 3000,
                cssClass: "ion-text-center",
              });
              toast.present();
              this.waiting = false;
            }, 3000);
          },
        },
      ],
    });

    await alert.present();
  }

  getCoinCount(): Observable<number> {
    return this.store.select(getUserTokenCount);
  }
}
