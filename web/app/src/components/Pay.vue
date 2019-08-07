<template>
  <section>
    <div>
      <header class="site-header">
        <page-header></page-header>
        <div id="title">Pay</div>
      </header>

      <main>
        <section class="container">
          <form id="pay" v-on:submit.prevent="pay">
            <div>
              <div class="label-wrapper">
                <label>Amount</label>
              </div>
              <span>${{amount}}</span>
            </div>
            <div>
              <div class="label-wrapper">
                <label>Company</label>
              </div>
              <input type="text" class="custom" v-model="company" />
            </div>
            <div>
              <div class="label-wrapper">
                <label>Email</label>
              </div>
              <input type="text" class="custom" v-model="email" />
            </div>
            <div>
              <div class="label-wrapper">
                <label>Credit Card</label>
              </div>
              <card
                class="stripe-card"
                :class="{ complete }"
                :stripe="stripePublishableKey"
                :options="stripeOptions"
                @change="complete = $event.complete"
              />
            </div>
            <button class="button button-primary button-block button-shadow">Pay ${{amount}}</button>
          </form>
        </section>
      </main>
    </div>
  </section>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus';
import PageHeader from './landing/PageHeader';

export default {
  data() {
    return {
      complete: false,
      amount: null,
      company: '',
      email: '',
      stripeOptions: {
        // see https://stripe.com/docs/stripe.js#element-options for details
        style: {
          base: {
            // Add your base input styles here. For example:
            fontSize: '18px',
            // color: 'red',
          },
        },
      },
      stripePublishableKey: process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY,
    };
  },

  components: { Card, PageHeader },

  mounted: function() {
    // console.log(this.$route.query.amount);
    const { amount, company, email } = this.$route.query;
    this.amount = this.$route.query.amount;
    this.company = this.$route.query.company;
    this.email = this.$route.query.email;
  },

  methods: {
    pay() {
      return console.log(this.amount, this.company, this.email);
      createToken().then(data => {
        const { id: token } = data;
        this.$http
          .post('/leads', { email })
          .then(() => {
            this.submitting = false;
            this.submitted = true;
          })
          .catch(e => {
            console.error(e);
            this.submitting = false;
            this.error = true;
          });
      });
    },
  },
};
</script> 
 
<style lang="scss">
form#pay {
  width: 500px;
  margin: 0 auto;
  & > div {
    margin-bottom: 10px;
  }
}
.label-wrapper {
  width: 130px;
  display: inline-block;
}
.stripe-card,
input {
  vertical-align: middle;
  width: calc(100% - 130px);
  display: inline-block;
  &.custom {
    background: transparent;
    border: none;
    border-bottom: 1px solid lightgrey;
  }
}
button {
  margin-top: 20px;
  width: 100%;
  &:disabled {
    opacity: 0.4;
  }
}
.site-header {
  .header-brand {
    margin: 0 auto;
  }
}
#title {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
}
</style> 