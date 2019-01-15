<template>
  <div class="container-sm">
    <div class="newsletter-inner section-inner mb-32">
      <div class="newsletter-header text-center is-revealing">
        <h2 class="section-title mt-0">Stay in the know</h2>
        <p
          class="section-paragraph"
        >Clicker is currently in closed beta, but leave us your email and we'll keep you up to date with our broader launch.</p>
      </div>
      <form
        class="footer-form newsletter-form field field-grouped is-revealing"
        v-on:submit.prevent="onSubmit"
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
</template>

<script>
export default {
  name: 'Interested',
  data: function() {
    return {
      email: '',
      submitting: false,
      submitted: false,
    };
  },
  methods: {
    onSubmit() {
      this.submitting = true;
      // console.log(this.email);
      const { email } = this;
      this.$http
        .post('hitmeback', { email })
        .then(response => {
          console.log('cool', this.email);
        })
        .catch(e => {
          console.error(e);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
a[type='submit'] {
  -webkit-appearance: inherit;
}
button[disabled] {
  opacity: 0.6;
  pointer-events: none;
}
</style>

