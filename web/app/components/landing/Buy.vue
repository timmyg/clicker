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
        class="cta-inner section-inner center-content"
        v-bind:class="[dividers ? 'has-top-divider has-bottom-divider' : '']"
      >
        <div class="cta-slogan reveal-from-left is-revealed">
          <h4 class="m-0">
            {{ text || "Sign up for your free trial of Clicker today." }}
          </h4>
        </div>
        <c-button
          tag="a"
          class="button button-primary button-shadow"
          href="/#pricing"
        >
          Get Started
        </c-button>
      </div>
    </div>
  </section>
</template>

<script>
import CButton from "@/components/elements/Button.vue";
export default {
  name: "Buy",
  props: ["dividers", "text"],
  components: {
    CButton
  }
};
</script>
