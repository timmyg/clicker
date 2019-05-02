import { Component } from '@angular/core';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage {
  elements: Elements;
  card: StripeElement;

  // optional parameters
  elementsOptions: ElementsOptions = {
    locale: 'en',
  };

  stripeFormGroup: FormGroup;

  constructor(private toastController: ToastController, private stripeService: StripeService) {}

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
              iconColor: '#666EE8',
              color: '#31325F',
              lineHeight: '40px',
              fontWeight: 300,
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSize: '18px',
              '::placeholder': {
                color: '#CFD7E0',
              },
            },
          },
        });
        this.card.mount('#card-element');
      }
    });
  }

  buy() {
    // const name = this.stripeFormGroup.get('name').value;

    this.stripeService.createToken(this.card, {}).subscribe(async result => {
      if (result.token) {
        // Use the token to create a charge or a customer
        // https://stripe.com/docs/charges
        console.log(result.token);
        const toast = await this.toastController.create({
          message: `Card successfully added`,
          duration: 3000,
          cssClass: 'ion-text-center',
          
        });
        toast.present();
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
      }
    });
  }
}
