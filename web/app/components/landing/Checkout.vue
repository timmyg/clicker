<template>
  <div>
    <c-button
      v-if="priceId && priceId.length"
      tag="a"
      color="primary"
      wide
      @click="checkout"
      :disabled="generating"
    >
      <span v-if="generating">Building subscription...</span>
      <span v-else>Start free trial</span>
    </c-button>
    <c-button v-else tag="a" color="primary" wide href="#signup-form">
      <span>Let's Talk {{ priceId }}</span>
    </c-button>
  </div>
</template>

<script async>
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(process.env.NUXT_ENV_STRIPE_PUBLISHABLE_KEY);
import CButton from "@/components/elements/Button.vue";

import {
  Card,
  createToken,
  redirectToCheckout
} from "vue-stripe-elements-plus";

export default {
  props: ["priceId"],
  components: {
    CButton
  },
  data: function() {
    return {
      generating: false
    };
  },
  methods: {
    async checkout() {
      this.generating = true;
      const stripe = await stripePromise;
      // console.log("priceId", this.priceId, $nuxt.$route);
      this.$http
        .post(`${process.env.NUXT_ENV_API_BASE}/users/checkout`, {
          priceId: this.priceId
        })
        .then(response => response.json())
        .then(({ id: sessionId }) => {
          stripe.redirectToCheckout({ sessionId }).then(function(result) {
            alert(result.error.message);
            this.generating = false
          });
        });
    }
  }
};
</script>
