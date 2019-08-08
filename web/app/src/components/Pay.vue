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
            <div>
              <div class="label-wrapper">
                <label>Amount</label>
              </div>
              <span>${{amount}}</span>
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
            <button class="button button-primary button-block button-shadow">Pay ${{amount}}</button>
          </form>
          <section v-else>Payment completed. Check your email for receipt.</section>
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
      completed: false,
      error: null,
      amount: null,
      company: '',
      email: '',
      name: '',
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
    const { amount, company, email, name } = this.$route.query;
    this.amount = amount;
    this.company = company;
    this.email = email;
    this.name = name;
  },

  methods: {
    pay() {
      this.error = null;
      // return console.log(this.amount, this.company, this.email, this.name);
      const { amount, company, email, name } = this;
      if (!amount || !company || !email || !name) {
        return (this.error = 'Please fill out all fields');
      }
      createToken()
        .then(data => {
          console.log(data);
          const { id: token, amount, company, email, name } = data;
          this.$http
            .post('/users/charge', { id: token, amount, company, email, name })
            .then(x => {
              console.log(x);
              this.completed = true;
            })
            .catch(e => {
              console.error(e);
              this.error = e.message;
            });
        })
        .catch(e => {
          console.error(e);
          this.error = e.message;
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
</style> 