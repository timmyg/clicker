<template>
  <div class="container-sm">
    <div class="newsletter-inner section-inner mb-32">
      <div class="newsletter-header text-center is-revealing">
        <h2 class="section-title mt-0">Stay in the know</h2>
        <p
          class="section-paragraph"
        >Clicker is currently in closed beta, but leave us your email and we'll keep you up to date with our broader launch.</p>
        <p v-if="submitted" class="success">Thank you! We'll be in contact.</p>
        <p
          v-else-if="error"
          class="error"
        >Oh no! Something is wrong on our end. We've been alerted, please try again in a bit.</p>
        <form
          class="footer-form newsletter-form field field-grouped is-revealing"
          v-on:submit.prevent="onSubmit"
          v-else
        >
          <div class="control control-expanded">
            <input class="input" type="email" placeholder="email address" v-model.trim="email">
          </div>
          <div class="control">
            <button
              type="submit"
              :disabled="submitting"
              class="button button-primary button-block button-shadow"
            >Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Interested',
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
      this.$analytics.alias(email);
      this.$http
        .post('/leads/hitmeback', { email })
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
</style>
