<template>
  <section class="hero section illustration-section-01">
    <div class="container">
      <div class="hero-inner section-inner">
        <div class="split-wrap">
          <div class="split-item">
            <div class="hero-content split-item-content center-content-mobile">
              <h1 class="mt-0 mb-16 reveal-from-left">Landing template for startups</h1>
              <p
                class="m-0 mb-24 reveal-from-left"
                v-scroll-reveal.reset="{ delay: 200 , origin: 'left'}"
              >Our landing page template works on all devices, so you only have to set it up once, and get beautiful results forever.</p>
              <div class="reveal-from-left" data-reveal-delay="400">
                <a class="button button-primary button-wide-mobile" href="#">Get started</a>
              </div>
            </div>
            <div
              class="hero-figure is-3d split-item-image split-item-image-fill illustration-element-01 reveal-scale-up"
            >
              <img src="/images/hero-image.svg" alt="Hero image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
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
  // import VueScrollReveal from 'vue-scroll-reveal';
};
</script>
