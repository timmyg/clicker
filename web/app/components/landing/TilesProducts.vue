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
          <div
            v-if="skip !== 'manager'"
            class="tiles-item reveal-from-bottom center-content"
          >
            <div class="tiles-item-inner">
              <div class="features-tiles-item-content">
                <h4 class="mt-0 mb-8 header">
                  <span class="name">
                    Clicker TV for Staff
                    <img
                      src="/images/landing/feature-tile-icon-001.svg"
                      alt="Feature tile icon 01"
                      width="64"
                      height="64"
                    />
                  </span>
                </h4>
                <p class="m-0 text-sm">
                  Give your staff the tool they need to field guest channel
                  requests easily and quickly. <br />
                  <nuxt-link to="/clicker-tv/staff" class="text-sm"
                    >Learn More →</nuxt-link
                  >
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="skip !== 'clicker-tv'"
            class="tiles-item reveal-from-bottom center-content"
            data-reveal-delay="200"
          >
            <div class="tiles-item-inner">
              <div class="features-tiles-item-content">
                <h4 class="mt-0 mb-8 header">
                  <span class="name">
                    Clicker TV for Guests
                    <img
                      src="/images/landing/feature-tile-icon-002.svg"
                      alt="Feature tile icon 02"
                      width="64"
                      height="64"
                    />
                  </span>
                </h4>
                <p class="m-0 text-sm">
                  Give your guests an unforgettable experience by giving them
                  control of a TV, just like their living room.<br />
                  <nuxt-link to="/clicker-tv/guests" class="text-sm"
                    >Learn More →</nuxt-link
                  >
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="skip !== 'control-center'"
            class="tiles-item reveal-from-bottom center-content"
            data-reveal-delay="400"
          >
            <div class="tiles-item-inner">
              <div class="features-tiles-item-content">
                <h4 class="mt-0 mb-8 header">
                  <span class="name">
                    Control Center
                    <img
                      src="/images/landing/feature-tile-icon-004.svg"
                      alt="Feature tile icon 03"
                      width="64"
                      height="64"
                    />
                  </span>
                </h4>
                <p class="m-0 text-sm">
                  We'll manage TVs automatically throughout the day remotely -
                  tailored for your venue's concept. <br />
                  <nuxt-link to="/control-center" class="text-sm"
                    >Learn More →</nuxt-link
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
  // name: "CFeaturesTiles",
  components: {
    CSectionHeader,
    CImage
  },
  props: ["skip"],
  mixins: [SectionTilesProps],
  data() {
    return {
      sectionHeader: {
        title: "Explore other Clicker products"
        // paragraph:
        //   "Vitae aliquet nec ullamcorper sit amet risus nullam eget felis semper quis lectus nulla at volutpat diam ut venenatis tellus—in ornare."
      }
    };
  }
};
</script>

<style lang="scss" scoped>
section.features-tiles {
  background: #efefef;
}
.features-tiles-item-content {
  .name {
    position: relative;
    img {
      display: inline;
      position: absolute;
      left: -60px;
      top: -20px;
    }
  }
}
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
