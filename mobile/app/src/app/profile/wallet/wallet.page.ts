import { Component } from '@angular/core';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController, ModalController } from '@ionic/angular';
import * as fromUser from '../../state/user/user.actions';
import { Store } from '@ngrx/store';
import * as fromStore from '../../state/app.reducer';
import { Observable } from 'rxjs';
import { Card } from 'src/app/state/user/card.model';
import { getUserCard } from 'src/app/state/user';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage {
  elements: Elements;
  card: StripeElement;
  userCard$: Observable<Card>;
  waiting: boolean;

  // optional parameters
  elementsOptions: ElementsOptions = {
    locale: 'en',
  };

  selectedAmount;
  stripeFormGroup: FormGroup;
  fundingAmounts = [
    {
      tokens: 5,
      dollars: 5,
    },
    {
      tokens: 10,
      dollars: 10,
    },
    {
      tokens: 25,
      dollars: 25,
    },
  ];

  constructor(
    private store: Store<fromStore.AppState>,
    private toastController: ToastController,
    private stripeService: StripeService,
    private modalController: ModalController,
  ) {
    this.userCard$ = this.store.select(getUserCard);
  }

  ngOnInit() {
    // this.stripeFormGroup = this.fb.group({
    //   name: ['', [Validators.required]],
    // });
    this.stripeService.elements(this.elementsOptions).subscribe(elements => {
      this.elements = elements;
      // Only mount the element the first time
      if (!this.card) {
        this.card = this.elements.create('card', {
          style: {
            base: {
              fontSize: '24px',
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
        console.log(result);
        this.store.dispatch(new fromUser.UpdateCard(result.token.id));
        const toast = await this.toastController.create({
          message: `Card successfully added`,
          duration: 3000,
          cssClass: 'ion-text-center',
        });
        toast.present();
        this.waiting = false;
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
    this.store.dispatch(new fromUser.AddFunds(this.selectedAmount.dollars));
    setTimeout(async () => {
      this.waiting = false;
      const toast = await this.toastController.create({
        message: `Successfully purchased ${this.selectedAmount.tokens} tokens`,
        duration: 3000,
        cssClass: 'ion-text-center',
      });
      toast.present();
      this.onClose();
    }, 3000);
  }

  async onAmountChange(e) {
    this.selectedAmount = this.fundingAmounts.find(f => f.dollars === +e.detail.value);
  }

  onClose() {
    this.modalController.dismiss();
  }
}
