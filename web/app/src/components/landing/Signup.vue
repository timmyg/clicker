<template>
  <section
    class="cta section center-content-mobile"
    v-scroll-reveal="{
  origin : 'right',
  delay    : 20,
  distance : '40px',
  easing   : 'ease-in-out'
  }"
  >
    <div class="container">
      <div class="cta-inner section-inner cta-split has-top-divider has-bottom-divider">
        <div class="cta-slogan reveal-from-left is-revealed">
          <h3 class="m-0">Unleash the future of sports programming.</h3>
        </div>
        <p v-if="submitted" class="success">Thank you! We'll be in contact.</p>
        <p
          v-else-if="error"
          class="error"
        >Oh no! Something is wrong on our end. We've been alerted, please try again in a bit.</p>
        <form
          class="footer-form newsletter-form field field-grouped"
          id="signup-form"
          v-on:submit.prevent="onSubmit"
          v-else
        >
          <div class="control control-expanded">
            <input class="input" type="email" placeholder="Enter your email" v-model.trim="email" />
          </div>
          <div class="control">
            <button
              type="submit"
              :disabled="submitting"
              class="button button-primary button-block button-shadow"
            >I'm Interested</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Signup',
  data: function() {
    return {
      email: '',
      submitting: false,
      submitted: false,
      error: false,
    };
  },
  methods: {
    onSubmit() {
      this.submitting = true;
      const { email } = this;
      console.log('$analytics');
      console.log(this.$analytics);
      console.log(email);
      if (this.$analytics) {
        this.$analytics.alias(email);
      }
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
    },
  },
};
</script>

<style lang="scss" scoped>
.error {
  color: get-color(alert, error);
}
.success {
  color: get-color(alert, success);
}
.center {
  margin: 0 auto;
}
@include media('<medium') {
  .field-grouped {
    flex-direction: column;
  }
  button {
    margin-top: 8px;
  }
}
</style>