import { Component } from '@angular/core';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { FormGroup } from '@angular/forms';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import * as fromApp from '../state/app/app.actions';
import * as fromUser from '../state/user/user.actions';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { Observable } from 'rxjs';
import { Card } from 'src/app/state/user/card.model';
import { getUserCard } from 'src/app/state/user';
import { getPlans } from 'src/app/state/app';
import { getUserTokenCount } from '../state/user';
import { SegmentService } from 'ngx-segment-analytics';
import { Globals } from '../globals';
import { Plan } from '../state/app/plan.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage {
  elements: Elements;
  card: StripeElement;
  userCard$: Observable<Card>;
  plans$: Observable<Plan[]>;
  waiting: boolean;

  // optional parameters
  elementsOptions: ElementsOptions = {
    locale: 'en',
  };

  selectedPlan: Plan;
  stripeFormGroup: FormGroup;
  // fundingAmounts = [
  //   {
  //     tokens: 5,
  //     dollars: 5,
  //   },
  //   {
  //     tokens: 10,
  //     dollars: 10,
  //   },
  //   {
  //     tokens: 25,
  //     dollars: 25,
  //   },
  // ];

  constructor(
    private store: Store<fromStore.AppState>,
    private toastController: ToastController,
    private stripeService: StripeService,
    private modalController: ModalController,
    public alertController: AlertController,
    private segment: SegmentService,
    private globals: Globals,
  ) {
    this.userCard$ = this.store.select(getUserCard);
    this.plans$ = this.store.select(getPlans);
  }

  ngOnInit() {
    this.store.dispatch(new fromApp.LoadPlans());
    // this.store.dispatch(new fromUser.LoadWallet());
    this.stripeService.elements(this.elementsOptions).subscribe(elements => {
      this.elements = elements;
      // Only mount the element the first time
      if (!this.card) {
        this.card = this.elements.create('card', {
          style: {
            base: {
              fontSize: '18px',
            },
          },
        });
        this.card.mount('#card-element');
      }
    });
  }

  addCard() {
    // const name = this.stripeFormGroup.get('name').value;
    this.waiting = true;
    this.stripeService.createToken(this.card, {}).subscribe(async result => {
      if (result.token) {
        // Use the token to create a charge or a customer
        // https://stripe.com/docs/charges
        this.store.dispatch(new fromUser.UpdateCard(result.token.id));
        setTimeout(async () => {
          const toast = await this.toastController.create({
            message: `Card successfully added`,
            duration: 3000,
            cssClass: 'ion-text-center',
          });
          toast.present();
          this.waiting = false;
          this.segment.track(this.globals.events.payment.sourceAdded, {
            type: 'Credit Card',
          });
        }, 3000);
      } else if (result.error) {
        // Error creating the token
        console.error(result.error.message);
        const toast = await this.toastController.create({
          message: result.error.message,
          duration: 3000,
          color: 'danger',
          cssClass: 'ion-text-center',
        });
        toast.present();
        this.waiting = false;
      }
    });
  }

  purchase() {
    this.waiting = true;
    this.store.dispatch(new fromUser.AddFunds(this.selectedPlan));
    setTimeout(async () => {
      this.waiting = false;
      const toast = await this.toastController.create({
        message: `Successfully purchased ${this.selectedPlan.tokens} tokens`,
        duration: 3000,
        cssClass: 'ion-text-center',
      });
      toast.present();
      this.onClose();
      this.segment.track(this.globals.events.payment.fundsAdded, {
        amount: this.selectedPlan.dollars,
      });
    }, 3000);
  }

  async onAmountChange(e) {
    this.plans$.pipe(first()).subscribe(plans => {
      this.selectedPlan = plans.find(f => f.dollars === +e.detail.value);
    });
  }

  onClose() {
    this.modalController.dismiss();
  }

  async removeCard() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'You will need to add a new credit card to purchase tokens.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Remove Card',
          role: 'destructive',
          cssClass: 'secondary',
          handler: async () => {
            this.waiting = true;
            this.store.dispatch(new fromUser.DeleteCard());
            setTimeout(async () => {
              const toast = await this.toastController.create({
                message: `Card removed`,
                duration: 3000,
                cssClass: 'ion-text-center',
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
