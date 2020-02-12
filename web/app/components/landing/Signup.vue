<template>
  <section
    class="cta section center-content-mobile"
    v-scroll-reveal="{
      origin: 'right',
      delay: 20,
      distance: '40px',
      easing: 'ease-in-out'
    }"
  >
    <div class="container">
      <div
        class="cta-inner section-inner cta-split "
        v-bind:class="[dividers ? 'has-top-divider has-bottom-divider' : '']"
      >
        <div class="cta-slogan reveal-from-left is-revealed">
          <h4 class="m-0">Unleash the future of sports programming.</h4>
        </div>
        <SignupForm />
      </div>
    </div>
  </section>
</template>

<script>
import SignupForm from "~/components/landing/SignupForm";

export default {
  name: "Signup",
  props: ["dividers"],
  components: {
    SignupForm
  }
};
</script>
