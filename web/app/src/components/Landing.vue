<template>
  <section class="is-boxed">
    <div class="body-wrap boxed-container">
      <header class="site-header">
        <page-header></page-header>
      </header>

      <main>
        <section class="hero">
          <hero></hero>
        </section>

        <section class="features section text-center">
          <features></features>
        </section>

        <!-- <section class="features-tabs section">
          <features-tabs></features-tabs>
        </section>-->
        <section class="testimonials section">
          <quotes></quotes>
        </section>

        <!-- <section class="pricing section">
          <pricing></pricing>
        </section>-->
        <section class="newsletter section">
          <interested></interested>
        </section>
      </main>

      <footer class="site-footer text-light">
        <page-footer></page-footer>
      </footer>
      <analytics></analytics>
    </div>
  </section>
</template>

<script>
import Vue from 'vue';
import Quotes from './landing/Quotes';
import Hero from './landing/Hero';
import Features from './landing/Features';
import FeaturesTabs from './landing/FeaturesTabs';
import PageHeader from './landing/PageHeader';
import PageFooter from './landing/PageFooter';
import Interested from './landing/Interested';
import Analytics from './Analytics';
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
    Quotes,
    Hero,
    Features,
    FeaturesTabs,
    PageHeader,
    PageFooter,
    Interested,
    Analytics,
  },
  mounted: function() {
    this.$sr.reveal('.feature', {
      delay: 150,
      duration: 1000,
      distance: '60px',
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      origin: 'bottom',
      interval: 150,
    });
    this.$sr.reveal('.tab-link', {
      delay: 150,
      duration: 700,
      distance: '50px',
      easing: 'cubic-bezier(0.715, 0.21, 0.95, 1)',
      origin: 'left',
      interval: 50,
    });
    this.$sr.reveal('.tab-panel', {
      delay: 50,
      duration: 300,
      distance: '10px',
      easing: 'cubic-bezier(0.15, 0.21, 0.95, 1)',
      origin: 'bottom',
    });
    this.$sr.reveal('.testimonial', {
      delay: 90,
      duration: 600,
      distance: '10px',
      easing: 'cubic-bezier(0.6, 0.2, 0.1, 1)',
      origin: 'bottom',
    });
    this.$sr.reveal('.newsletter', {
      delay: 90,
      duration: 600,
      distance: '10px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'right',
    });
    this.$sr.reveal('.hero-title, .hero-paragraph, .hero-illustration', {
      delay: 90,
      duration: 600,
      distance: '10px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'right',
    });
    this.$sr.reveal('.brand .logo', {
      delay: 1350,
      duration: 600,
      distance: '5px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'right',
    });
    this.$sr.reveal('.brand .name', {
      delay: 650,
      duration: 600,
      distance: '5px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'top',
    });
  },
  methods: {
    tabClick: function(e) {
      e.preventDefault();
      const target = e.target;
      let tabLinksContainer = target.parentNode.parentNode;
      let tabPanels = tabLinksContainer.nextElementSibling.getElementsByClassName('tab-panel');
      let tabLinks = tabLinksContainer.getElementsByClassName('tab-link');
      // Remove is-active class from all links and panels
      for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove('is-active');
      }
      for (let i = 0; i < tabPanels.length; i++) {
        tabPanels[i].classList.remove('is-active');
      }
      // Get the ID of panel to display
      let tabID = target.getAttribute('href');
      // Add is-active class to matching link and panel
      target.classList.add('is-active');
      document.querySelector(tabID).classList.add('is-active');
    },
  },
};
</script>
