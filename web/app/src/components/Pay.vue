<template>
  <section>
    <div>
      <header class="site-header">
        <page-header></page-header>
        <div id="title">Pay</div>
      </header>

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

export default {
  data() {
    return {
      completed: false,
      submitting: false,
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
      this.submitting = true;
      // return console.log(this.amount, this.company, this.email, this.name);
      const { amount, company, email, name } = this;
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
          const body = { token, amount, company, email, name };
          console.log(body);
          this.$http
            .post('/users/charge', body)
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