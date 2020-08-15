<template>
  <layout-basic>
    <Header></Header>
    <section class="main center-content">
      <img
        src="/images/landing/illustrations/undraw-fans.svg"
        alt="Fans on couch celebrating"
        v-scroll-reveal="{ delay: 900, origin: 'top', duration: 1600, easing: 'cubic-bezier(0.5, 0, 0, 1)', scale: .1 }"
      />
      <h2 v-scroll-reveal="{ delay: 200, origin: 'left' }">Your order is complete!</h2>
      <div
        class="h6 muted sm"
        v-scroll-reveal="{ delay: 400, origin: 'right' }"
      >Your Clicker device will be shipped out soon.</div>
      <div class="muted sm" v-scroll-reveal="{ delay: 600, origin: 'bottom' }">
        In the meantime, please make sure your DIRECTV boxes are setup for
        internet access and external device access. See more
        <nuxt-link to="/setup" class="text-sm">here</nuxt-link>.
      </div>
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";

export default {
  components: {
    Header,
    LayoutBasic
  }
};
</script>

<style lang="scss" scoped>
img {
  height: 180px;
}
div.sm {
  max-width: 580px;
  margin: 0 auto;
}
</style>
