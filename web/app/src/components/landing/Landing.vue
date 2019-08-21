<template>
  <layout-basic>
    <main class="site-content">
      <Hero />
      <Features />
      <Pricing />
      <Faq />
      <Signup />
    </main>
  </layout-basic>
</template>

<script>
import Hero from '@/components/landing/Hero';
import Faq from '@/components/landing/Faq';
import Features from '@/components/landing/Features';
import LayoutBasic from '@/components/layouts/Basic';
import Pricing from '@/components/landing/Pricing';
import Signup from '@/components/landing/Signup';
import Vue from 'vue';
import VueScrollReveal from 'vue-scroll-reveal';
Vue.use(VueScrollReveal, {
  class: 'v-scroll-reveal', // A CSS class applied to elements with the v-scroll-reveal directive; useful for animation overrides.
  duration: 800,
  scale: 1,
  distance: '10px',
  mobile: false,
});
export default {
  components: {
    Faq,
    Features,
    Hero,
    LayoutBasic,
    Pricing,
    Signup,
  },
};
</script>

<style lang="scss" scoped>
main.site-content {
  visibility: hidden;
}
</style>