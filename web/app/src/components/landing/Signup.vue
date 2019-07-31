<template>
  <p v-if="submitted" class="success">Thank you! We'll be in contact.</p>
  <p
    v-else-if="error"
    class="error"
  >Oh no! Something is wrong on our end. We've been alerted, please try again in a bit.</p>
  <form
    class="footer-form newsletter-form field field-grouped"
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
      >Learn More</button>
    </div>
  </form>
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
      this.$analytics.alias(email);
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
button[type='submit'] {
  display: inline-flex;
  &[disabled] {
    opacity: 0.6;
    pointer-events: none;
  }
}
.error {
  color: color(additional-2, 1);
}
.success {
  color: color(additional, 3);
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

