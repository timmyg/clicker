<template>
  <div @click="checkout">checkout</div>
</template>

<script async>
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(process.env.NUXT_ENV_STRIPE_PUBLISHABLE_KEY);

import {
  Card,
  createToken,
  redirectToCheckout
} from "vue-stripe-elements-plus";

export default {
  data: () => ({
    // loading: false,
  }),
  methods: {
    async checkout() {
      const stripe = await stripePromise;
      this.$http
        .post(`${process.env.NUXT_ENV_API_BASE}/users/checkout`, {})
        .then(response => response.json())
        .then(({ id: sessionId }) => {
          stripe.redirectToCheckout({ sessionId }).then(function(result) {
            alert(result.error.message);
          });
        });
    }
  }
};
</script>
