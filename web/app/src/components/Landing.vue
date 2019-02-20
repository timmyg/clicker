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
        <section class="features-tabs section">
          <features-tabs></features-tabs>
        </section>

        <section class="features section text-center">
          <features></features>
        </section>

        <!-- <section class="testimonials section">
          <quotes></quotes>
        </section> -->

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

Vue.use(VueScrollReveal); 

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
  mounted: function() {},
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
