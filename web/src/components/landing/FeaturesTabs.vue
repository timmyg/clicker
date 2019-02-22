<template>
  <div class="mt-64 mb-64">
    <p class="container blurb">
      With our
      <span class="brand-font">Clicker</span> app, guests will be able to pick the channel and TV they want to watch.
      <br>
      <br>
    </p>
    <h3 class="text-center">In 4 easy steps, guests can:</h3>
    <div class="features-desktop container">
      <div class="tabs-container mt-32">
        <ul class="tabs-links">
          <li v-for="(feature, index) in features" :key="feature.img">
            <a
              href="#tab-1"
              class="tab-link"
              :class="{'is-active': index === activeTab}"
              v-on:click="tabClick(index)"
            >
              <span class="h4 m-0">{{index+1}}. {{feature.message}}</span>
            </a>
          </li>
        </ul>
        <div class="tabs-content" v-for="(feature, index) in features" :key="feature.img">
          <div class="tab-panel" :class="{'is-active': index === activeTab}">
            <img :src="feature.img" alt>
          </div>
        </div>
      </div>
    </div>
    <div class="carousel text-center">
      <carousel :navigationEnabled="true" :perPage="1">
        <slide v-for="(feature, index) in features" :key="feature.img">
          <span class="label">
            <span>{{index+1}}. {{feature.message}}</span>
            <img :src="feature.img">
          </span>
        </slide>
      </carousel>
    </div>
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel';
export default {
  name: 'FeaturesTabs',
  components: {
    Carousel,
    Slide,
  },
  data: function() {
    return {
      activeTab: 0,
      features: [
        {
          message: 'Pick bar or restaurant location',
          img: '/img/mockups/1-location.png',
        },
        {
          message: 'Choose game or channel',
          img: '/img/mockups/2-game.png',
        },
        {
          message: 'Select the TV to watch it on',
          img: '/img/mockups/3-tv.png',
        },
        {
          message: 'Use tokens to complete reservation',
          img: '/img/mockups/4-confirm.png',
        },
      ],
    };
  },
  methods: {
    tabClick(tabNumber) {
      this.activeTab = tabNumber;
    },
  },
};
</script>

<style lang="scss">
// slide {
//   // height: 300px;

// }
.VueCarousel-inner {
  height: 300px;
}
img {
  height: 360px;
  margin: 0 auto;
  max-width: none;
  width: inherit;
}
.features-desktop {
  display: none;
}
button.VueCarousel-navigation-button[type='button'] {
  background-repeat: no-repeat;
  color: transparent;
  $button-position: 40px;
  &.VueCarousel-navigation-prev {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm43.4 289.1c7.5 7.5 7.5 19.8 0 27.3-3.8 3.8-8.7 5.6-13.6 5.6s-9.9-1.9-13.7-5.7l-94-94.3c-6.9-7.6-6.7-19.3.6-26.6l95.4-95.7c7.5-7.5 19.7-7.6 27.3 0 7.5 7.5 7.6 19.7 0 27.3l-81.9 81 79.9 81.1z'/></svg>");
    left: $button-position;
  }
  &.VueCarousel-navigation-next {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm244.5 0l-81.9-81.1c-7.5-7.5-7.5-19.8 0-27.3s19.8-7.5 27.3 0l95.4 95.7c7.3 7.3 7.5 19.1.6 26.6l-94 94.3c-3.8 3.8-8.7 5.7-13.7 5.7-4.9 0-9.9-1.9-13.6-5.6-7.5-7.5-7.6-19.7 0-27.3l79.9-81z'/></svg>");
    right: $button-position;
  }
  &.VueCarousel-navigation--disabled {
    opacity: 0.1;
  }
}
@include media('>large') {
  img {
    height: 600px;
  }
  .tabs-links {
    margin-top: 90px;
  }
}
@include media('>small') {
  img {
    height: 600px;
  }
  .carousel {
    display: none;
  }
  .features-desktop {
    display: block;
  }
}
</style>
