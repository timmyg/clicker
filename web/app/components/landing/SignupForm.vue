<template>
  <div class="wrapper">
    <span v-if="submitted" class="success">Thank you! We'll be in contact.</span>
    <p v-else-if="error" class="error">
      Oh no! Something is wrong on our end. We've been alerted, please try again
      in a bit.
    </p>
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
        >Let's Talk</button>
        <!-- <button
          type="submit"
          :disabled="submitting"
          class="button button-primary button-block button-shadow"
        >{{getButtonText()}}</button>-->
      </div>
    </form>
    <div v-if="oneMonthFree" class="promo brand-font">You're getting your first month free!</div>
    <div v-if="!submitted" class="promo brand-font">
      <a
        href="https://calendly.com/clicker-tim-g/meet"
        target="_blank"
        class="right schedule-call"
      >or, schedule a call</a>
    </div>
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
      error: false,
      oneMonthFree:
        this.$route.query &&
        this.$route.query.promo &&
        this.$route.query.promo === "bizcard-1month"
    };
  },
  methods: {
    onSubmit() {
      console.log(
        "onsubmit",
        process.env.BRANCH,
        process.env.NUXT_ENV_BRANCH,
        process.env.branch
      );
      const variant = process.env.branch;
      if (!this.email || !this.email.length) {
        return false;
      }
      this.submitting = true;
      const { email, emailBot1, emailBot2 } = this;
      // console.log({ email, emailBot1, emailBot2 });
      if (emailBot1 !== "dave@dmb.com" || emailBot2 !== "matthews@dmb.com") {
        console.info("get outta here bot!");
        // return;
      }
      // console.log(this.$segment);
      // console.log(email);
      if (this.$segment) {
        this.$segment.alias(email);
        this.$segment.track("Interested", {
          email,
          queryParams: this.$route.query,
          variant
        });
      }
      this.$http
        .post(`${process.env.NUXT_ENV_API_BASE}/leads`, {
          email,
          emailBot1,
          emailBot2,
          promo: this.$route.query && this.$route.query.promo
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
.wrapper {
  position: relative;
}

.right {
  float: right;
}
// .schedule-call {
//   position: absolute;
//   right: 0;
// }
.promo {
  // text-align: center;
  font-size: 14px;
  color: #0091ea;
  position: absolute;
  right: 0;
}
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
