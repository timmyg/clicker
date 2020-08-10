<template>
  <section
    class="features-tiles section"
    :class="[
      topOuterDivider && 'has-top-divider',
      bottomOuterDivider && 'has-bottom-divider',
      hasBgColor && 'has-bg-color',
      invertColor && 'invert-color'
    ]"
  >
    <div class="container">
      <div
        class="features-tiles-inner section-inner"
        :class="[
          topDivider && 'has-top-divider',
          bottomDivider && 'has-bottom-divider'
        ]"
      >
        <c-section-header :data="sectionHeader" class="center-content" />
        <div class="tiles-wrap" :class="[pushLeft && 'push-left']">
          <div class="tiles-item reveal-from-bottom center-content">
            <div class="tiles-item-inner">
              <div class="features-tiles-item-header">
                <div class="features-tiles-item-image mb-16 bg-1">
                  <img
                    src="/images/landing/feature-tile-icon-01.svg"
                    alt="Feature tile icon 01"
                    width="64"
                    height="64"
                  />
                </div>
              </div>
              <div class="features-tiles-item-content">
                <h4 class="mt-0 mb-8">Manager Mode</h4>
                <p class="m-0 text-sm">
                  Allow your guests to download the
                  <a
                    href="https://apps.apple.com/us/app/clicker-tv/id1471666907"
                    class="brand-font"
                    target="_blank"
                    >Clicker TV</a
                  >
                  mobile app and change the TV channels right from their phone.
                  <br />
                  <nuxt-link to="/manager-mode" class="text-sm"
                    >See more →</nuxt-link
                  >
                </p>
              </div>
            </div>
          </div>

          <div
            class="tiles-item reveal-from-bottom center-content"
            data-reveal-delay="200"
          >
            <div class="tiles-item-inner">
              <div class="features-tiles-item-header">
                <div class="features-tiles-item-image mb-16 bg-2">
                  <img
                    src="/images/landing/feature-tile-icon-02.svg"
                    alt="Feature tile icon 02"
                    width="64"
                    height="64"
                  />
                </div>
              </div>
              <div class="features-tiles-item-content">
                <h4 class="mt-0 mb-8">Clicker TV</h4>
                <p class="m-0 text-sm">
                  Allow your guests to download the
                  <a
                    href="https://apps.apple.com/us/app/clicker-tv/id1471666907"
                    class="brand-font"
                    target="_blank"
                    >Clicker TV</a
                  >
                  mobile app and change the TV channels right from their phone.
                  <br />
                  <nuxt-link to="/clicker-tv" class="text-sm"
                    >See more →</nuxt-link
                  >
                </p>
              </div>
            </div>
          </div>

          <div
            class="tiles-item reveal-from-bottom center-content"
            data-reveal-delay="400"
          >
            <div class="tiles-item-inner">
              <div class="features-tiles-item-header">
                <div class="features-tiles-item-image mb-16 bg-3">
                  <img
                    src="/images/landing/feature-tile-icon-04.svg"
                    alt="Feature tile icon 03"
                    width="64"
                    height="64"
                  />
                </div>
              </div>
              <div class="features-tiles-item-content">
                <h4 class="mt-0 mb-8">Control Center</h4>
                <p class="m-0 text-sm">
                  We'll manage TVs automatically throughout the day remotely -
                  tailored for your venue. <br />
                  <nuxt-link to="/control-center" class="text-sm"
                    >See more →</nuxt-link
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { SectionTilesProps } from "@/utils/SectionProps.js";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";
import CImage from "@/components/elements/Image.vue";

export default {
  name: "CFeaturesTiles",
  components: {
    CSectionHeader,
    CImage
  },
  mixins: [SectionTilesProps],
  data() {
    return {
      sectionHeader: {
        title: "",
        paragraph: ""
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.bg-1 {
  background-color: #0091ea;
}
.bg-2 {
  background-color: #eeeeee;
}
.bg-3 {
  background-color: #55c3f5;
}
</style>
