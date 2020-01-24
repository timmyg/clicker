<template>
  <div>
    <span v-if="submitted" class="success">Thank you! We'll be in contact.</span>
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
        <input
          class="input get-outta-here-bot"
          name="1"
          type="email"
          placeholder="Enter your email"
          v-model.trim="emailBot1"
          :required="!email.length"
        />
        <input
          class="input"
          name="2"
          type="email"
          placeholder="Enter your email"
          v-model.trim="email"
          :disabled="submitting"
          required
        />

        <input
          class="input get-outta-here-bot"
          name="3"
          type="email"
          placeholder="Enter your email"
          v-model.trim="emailBot2"
          :required="!email.length"
        />
      </div>
      <div class="control">
        <button
          type="submit"
          :disabled="submitting"
          class="button button-primary button-block button-shadow"
        >I'm Interested</button>
        <!-- <button
          type="submit"
          :disabled="submitting"
          class="button button-primary button-block button-shadow"
        >{{getButtonText()}}</button>-->
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "SignupForm",
  data: function() {
    return {
      email: "",
      emailBot1: "dave@dmb.com",
      emailBot2: "matthews@dmb.com",
      submitting: false,
      submitted: false,
      error: false
    };
  },
  methods: {
    // getButtonText() {
    //   return this.submitting ? "Submitting..." : "I'm Interested";
    // },
    onSubmit() {
      console.log("onsubmit");
      if (!this.email || !this.email.length) {
        return false;
      }
      this.submitting = true;
      const { email, emailBot1, emailBot2 } = this;
      console.log({ email, emailBot1, emailBot2 });
      if (emailBot1 !== "dave@dmb.com" || emailBot2 !== "matthews@dmb.com") {
        console.info("get outta here bot!");
        // return;
      }
      // console.log("$analytics");
      // console.log(this.$analytics);
      // console.log(email);
      if (this.$analytics) {
        this.$analytics.alias(email);
      }
      // console.log(this.$http);
      this.$http
        .post(`${process.env.NUXT_ENV_API_BASE}/leads`, {
          email,
          emailBot1,
          emailBot2
        })
        .then(() => {
          this.submitting = false;
          this.submitted = true;
        })
        .catch(e => {
          console.error(e);
          this.submitting = false;
          this.error = true;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.get-outta-here-bot {
  opacity: 0;
  position: absolute;
  top: -9999px;
  left: -9999px;
}
.error {
  color: get-color(alert, error);
}
.success {
  color: #0091ea;
}
.center {
  margin: 0 auto;
}
input {
  min-width: 260px;
}
@media (max-width: 767px) {
  .field-grouped {
    flex-direction: column;
  }
  button {
    margin-top: 8px;
  }
}
</style>
