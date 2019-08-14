<template>
  <section>
    <div>
      <Header>
        <div id="title">Pay</div>
      </Header>

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
              <span>${{amount}}/month (starting {{ start || now | moment("M/D/YY") }})</span>
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
            <button class="button button-primary button-block button-shadow" :disabled="submitting">
              <span v-if="isSubscription">Setup ${{amount}}/month autopay</span>
              <span v-if="isOneTime">Pay ${{amount}}</span>
            </button>
          </form>
          <section class="completed" v-else>
            <span
              v-if="isSubscription"
            >Successfully setup ${{amount}}/month autopay for the {{ start || now | moment("Do") }} of every month.</span>
            <span v-if="isOneTime">${{amount}} payment completed. Email receipt is on the way.</span>
            <div class="emojis mt-24">
              <div>🎉</div>
              <div>🎊</div>
              <div>🙌</div>
              <div>🎈</div>
            </div>
          </section>
        </section>
      </main>
    </div>
  </section>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus';
import Header from '@/components/layouts/Header';
import * as moment from 'moment';

export default {
  data() {
    console.log(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY);
    return {
      completed: false,
      submitting: false,
      isSubscription: false,
      isOneTime: false,
      error: null,
      start: null,
      now: moment().toDate(),
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

  components: { Card, Header },

  mounted: function() {
    const { amount, company, email, name, type, start, plan } = this.$route.query;
    this.amount = amount;
    this.company = company;
    this.email = email;
    this.name = name;
    this.type = type;
    this.plan = plan;
    // console.log(start);
    this.start = start ? moment(start, 'M-D-YYYY').toDate() : null;
    this.isSubscription = type === 'subscription';
    this.isOneTime = type === 'onetime';
    // console.log(this);
  },

  methods: {
    pay() {
      this.error = null;
      this.submitting = true;
      // return console.log(this.amount, this.company, this.email, this.name);
      const { amount, company, email, name, plan, start } = this;
      if (!amount || !company || !email || !name) {
        this.submitting = false;
        return (this.error = 'Please fill out all fields');
      }
      createToken()
        .then(data => {
          if (data.error) {
            this.submitting = false;
            return (this.error = data.error.message);
          }
          const token = data.token.id;
          const body = {
            token,
            amount,
            company,
            email,
            name,
            plan,
            start: start ? moment(start).unix() * 1000 : null,
          };
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
              // console.log(e);
              // console.log(e.response.data.message);
              this.error = e.response.data.message;
            })
            .finally(() => {
              this.submitting = false;
            });
        })
        .catch(e => {
          console.error(e);
          this.error = e.message;
          this.submitting = false;
        });
      // .finally(() => {
      //   this.submitting = false;
      // });
    },
  },
};
</script> 

<style lang="scss">
.site-header-center {
  padding: 20px 0;
  .header-brand {
    margin: 0 auto;
  }
}
</style>

<style lang="scss" scoped>
form#pay {
  width: inherit;
  margin: 0 auto;
  & > div {
    margin-bottom: 10px;
  }
}
.label-wrapper {
  // width: 130px;
  width: 100%;
  font-size: 12px;
  display: inline-block;
}
.stripe-card,
input {
  vertical-align: middle;
  // width: calc(100% - 130px);
  width: 100%;
  display: inline-block;
  &.custom {
    background: transparent;
    border: none;
    border-bottom: 1px solid lightgrey;
    width: 100%;
  }
}
button {
  margin-top: 20px;
  width: 100%;
  &:disabled {
    opacity: 0.4;
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
.emojis {
  div {
    font-size: 36px;
    display: inline-block;
    padding: 5px;
  }
  div:nth-child(1) {
    animation: shake #{random(7)}s 0s infinite;
  }
  div:nth-child(2) {
    animation: shake #{random(7)}s 0s infinite;
  }
  div:nth-child(3) {
    animation: shake #{random(7)}s 0s infinite;
  }
  div:nth-child(4) {
    animation: shake #{random(7)}s 0s infinite;
  }
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}
</style> 