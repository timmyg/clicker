<template>
  <section>
    <div>
      <!-- <header class="site-header">
        <page-header></page-header>
        <div id="title">Pay</div>
      </header>-->

      <main>
        <section class="container">
          <form id="pay" v-on:submit.prevent="pay" v-if="!completed">
            <div v-if="isOneTime">
              <div class="label-wrapper">
                <label>Amount</label>
              </div>
              <span>${{amount}}</span>
            </div>
            <div v-if="isSubscription">
              <div class="label-wrapper">
                <label>Amount</label>
              </div>
              <span>${{amount}}/month (starting {{ start | moment("M/D/YY") }})</span>
            </div>
            <div>
              <div class="label-wrapper">
                <label>Email</label>
              </div>
              <input type="text" class="custom" v-model="email" />
            </div>
            <div>
              <div class="label-wrapper">
                <label>Name</label>
              </div>
              <input type="text" class="custom" v-model="name" />
            </div>
            <div>
              <div class="label-wrapper">
                <label>Company</label>
              </div>
              <input type="text" class="custom" v-model="company" />
            </div>
            <div>
              <div class="label-wrapper">
                <label>Credit Card</label>
              </div>
              <card class="stripe-card" :stripe="stripePublishableKey" :options="stripeOptions" />
            </div>
            <p class="error" v-if="error">{{error}}</p>
            <button
              class="button button-primary button-block button-shadow"
              :disabled="submitting"
            >Pay ${{amount}}</button>
          </form>
          <section class="completed" v-else>Payment completed. Email receipt is on the way.</section>
        </section>
      </main>
    </div>
  </section>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus';
import PageHeader from './landing/PageHeader';
import * as moment from 'moment';

export default {
  data() {
    return {
      completed: false,
      submitting: false,
      isSubscription: false,
      isOneTime: false,
      error: null,
      start: null,
      type: null,
      amount: null,
      company: null,
      email: null,
      name: null,
      stripeOptions: {
        style: {
          base: {
            fontSize: '18px',
          },
        },
      },
      stripePublishableKey: process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY,
    };
  },

  components: { Card, PageHeader },

  mounted: function() {
    const { amount, company, email, name, type, start } = this.$route.query;
    this.amount = amount;
    this.company = company;
    this.email = email;
    this.name = name;
    this.type = type;
    this.start = start ? moment(start, 'M-D-YYYY').toDate() : moment.toDate();
    this.isSubscription = type === 'subscription';
    this.isOneTime = type === 'onetime';
  },

  methods: {
    pay() {
      this.error = null;
      this.submitting = true;
      // return console.log(this.amount, this.company, this.email, this.name);
      const { amount, company, email, name, plan } = this;
      if (!amount || !company || !email || !name) {
        this.submitting = false;
        return (this.error = 'Please fill out all fields');
      }
      createToken()
        .then(data => {
          if (data.error) {
            return (this.error = data.error.message);
          }
          const token = data.token.id;
          const body = { token, amount, company, email, name, plan };
          console.log(body);
          // return;
          const endpoint = this.isOneTime ? '/users/charge' : '/users/subscribe';
          this.$http
            .post(endpoint, body)
            .then(x => {
              console.log(x);
              this.completed = true;
              this.submitting = false;
            })
            .catch(e => {
              // TODO this isnt working for the actual message...
              // console.error(e);
              // console.error(e.message);
              // console.error(JSON.parse(e));
              // this.error = e.message;
              this.error = 'Sorry, there was an issue with you card';
            })
            .finally(() => {
              this.submitting = false;
            });
        })
        .catch(e => {
          console.error(e);
          this.error = e.message;
        })
        .finally(() => {
          this.submitting = false;
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
$danger: #cf665b;
.error {
  border-left: 5px solid $danger;
  color: $danger;
  margin-top: 8px;
  padding: 16px;
  font-size: 14px;
}
.completed {
  margin-top: 40px;
  text-align: center;
}
</style> 