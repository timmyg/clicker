<template>
  <!-- <stripe-checkout
    ref="checkoutRef"
    :pk="publishableKey"
    :items="items"
    :successUrl="successUrl"
    :cancelUrl="cancelUrl"
  >
    <template slot="checkout-button">
      <button @click="checkout">Shut up and take my money!</button>
    </template>
  </stripe-checkout> -->
  <div @click="checkout">checkout</div>
</template>

<script async>
// import { StripeCheckout } from "vue-stripe-checkout";
import { loadStripe } from "@stripe/stripe-js";
// const stripe = Stripe("pk_test_emgg6PM2oFAFsEmyTjomZQbG00vopAGOw7");
const stripePromise = loadStripe(process.env.NUXT_ENV_STRIPE_PUBLISHABLE_KEY);
// console.log({ stripe });

import {
  Card,
  createToken,
  redirectToCheckout
} from "vue-stripe-elements-plus";

export default {
  // components: {
  //   StripeCheckout
  // },
  data: () => ({
    // loading: false,
    // publishableKey: process.env.NUXT_ENV_STRIPE_PUBLISHABLE_KEY,
    // items: [
    //   {
    //     price: "price_1HAQPBIkuoCxKwvy8zUKNxxx",
    //     quantity: 1
    //   }
    // ],
    // successUrl:
    //   "https://tryclicker.com/success?session_id={CHECKOUT_SESSION_ID}",
    // cancelUrl: "https://tryclicker.com/cancel"
  }),
  methods: {
    async checkout() {
      // this.$refs.checkoutRef.redirectToCheckout();
      console.log(stripePromise);
      const stripe = await stripePromise;
      console.log("checkout...");
      console.log(Card, createToken, redirectToCheckout);
      this.$http
        .post(`${process.env.NUXT_ENV_API_BASE}/users/checkout`, {})
        .then(response => response.json())
        .then(({ id: sessionId }) => {
          console.log(sessionId);
          console.log(stripe);
          // stripe.redirectToCheckout
          stripe
            .redirectToCheckout({
              // Make the id field from the Checkout Session creation API response
              // available to this file, so you can provide it as argument here
              // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
              sessionId
            })
            .then(function(result) {
              // If `redirectToCheckout` fails due to a browser or network
              // error, display the localized error message to your customer
              // using `result.error.message`.
            });
          // console.log(x.b?ody);
          // console.log(x.body());
          // console.log(x.json());
        });
    }
  }
};
</script>
