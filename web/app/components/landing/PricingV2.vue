<template>
  <section
    class="pricing section"
    :class="[
      topOuterDivider && 'has-top-divider',
      bottomOuterDivider && 'has-bottom-divider',
      hasBgColor && 'has-bg-color',
      invertColor && 'invert-color'
    ]"
  >
    <div class="container">
      <div
        class="pricing-inner section-inner"
        :class="[
          topDivider && 'has-top-divider',
          bottomDivider && 'has-bottom-divider'
        ]"
      >
        <c-section-header :data="sectionHeader" class="center-content" />
        <div v-if="pricingSwitcher" class="pricing-switcher center-content">
          <c-switch
            v-model="priceChangerValue"
            true-value="1"
            false-value="0"
            right-label="Billed Annually"
          >Billed Monthly</c-switch>
        </div>
        <div v-if="pricingSlider" class="pricing-slider center-content">
          <label class="form-slider">
            <span class="mb-16">How many DIRECTV boxes do you have?</span>
            <div>
              <input
                type="range"
                ref="slider"
                v-model="priceChangerValue"
                @input="handlePricingSlide"
              />
            </div>
          </label>
          <div ref="sliderValue" class="pricing-slider-value">{{ getPricingData(boxesInput) }}</div>
        </div>
        <div class="tiles-wrap" :class="[pushLeft && 'push-left']">
          <div class="tiles-item reveal-from-bottom">
            <div class="tiles-item-inner has-shadow">
              <div class="pricing-item-content">
                <div class="pricing-item-header pb-24 mb-24">
                  <div class="pricing-item-price mb-8">
                    <div
                      v-if="
                        getPricingData(this.priceOutput.plan1, 1) ===
                          'contact-us'
                      "
                    >
                      <span class="pricing-item-price-amount h1">Let's Talk!</span>
                    </div>
                    <div v-else>
                      <span class="pricing-item-price-currency h3">
                        {{
                        getPricingData(this.priceOutput.plan1, 0)
                        }}
                      </span>
                      <span class="pricing-item-price-amount h1">
                        {{
                        getPricingData(this.priceOutput.plan1, 1)
                        }}
                      </span>
                      <span class="pricing-item-price-amount text-sm">
                        {{
                        getPricingData(this.priceOutput.plan1, 2)
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="text-xs text-color-low">Allow staff to manage TVs from their phone</div>
                </div>
                <div class="pricing-item-features mb-40">
                  <div
                    class="pricing-item-features-title h6 text-xs text-color-high mb-24"
                  >What’s included</div>
                  <ul class="pricing-item-features-list list-reset text-xs mb-32">
                    <li class="is-checked">Excepteur sint occaecat velit</li>
                    <li class="is-checked">Excepteur sint occaecat velit</li>
                    <li class="is-checked">Excepteur sint occaecat velit</li>
                    <li>Excepteur sint occaecat velit</li>
                    <li>Excepteur sint occaecat velit</li>
                  </ul>
                </div>
              </div>
              <div class="pricing-item-cta mb-8">
                <Checkout :priceId="plan1PriceId" />
              </div>
            </div>
          </div>

          <div class="tiles-item reveal-from-bottom" data-reveal-delay="200">
            <div class="tiles-item-inner has-shadow">
              <div class="pricing-item-content">
                <div class="pricing-item-header pb-24 mb-24">
                  <div class="pricing-item-price mb-8">
                    <div
                      v-if="
                        getPricingData(this.priceOutput.plan2, 1) ===
                          'contact-us'
                      "
                    >
                      <span class="pricing-item-price-amount h1">Let's Talk!</span>
                    </div>
                    <div v-else>
                      <span class="pricing-item-price-currency h3">
                        {{
                        getPricingData(this.priceOutput.plan2, 0)
                        }}
                      </span>
                      <span class="pricing-item-price-amount h1">
                        {{
                        getPricingData(this.priceOutput.plan2, 1)
                        }}
                      </span>
                      <span class="pricing-item-price-amount text-sm">
                        {{
                        getPricingData(this.priceOutput.plan2, 2)
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="text-xs text-color-low">Clicker TV and Control Center, fully loaded</div>
                </div>
                <div class="pricing-item-features mb-40">
                  <div
                    class="pricing-item-features-title h6 text-xs text-color-high mb-24"
                  >What’s included</div>
                  <ul class="pricing-item-features-list list-reset text-xs mb-32">
                    <li class="is-checked">Excepteur sint occaecat velit</li>
                    <li class="is-checked">Excepteur sint occaecat velit</li>
                    <li class="is-checked">Excepteur sint occaecat velit</li>
                    <li class="is-checked">Excepteur sint occaecat velit</li>
                    <li>Excepteur sint occaecat velit</li>
                  </ul>
                </div>
              </div>
              <div class="pricing-item-cta mb-8">
                <Checkout :priceId="plan2PriceId" />
              </div>
            </div>
          </div>
        </div>
        <div class="center-content text-xs text-color-low">No risk. Cancel anytime.</div>
      </div>
    </div>
  </section>
</template>

<script>
import { SectionTilesProps } from "@/utils/SectionProps.js";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";
import CSwitch from "@/components/elements/Switch.vue";
import CButton from "@/components/elements/Button.vue";
import Checkout from "@/components/landing/Checkout";

export default {
  name: "CPricing",
  components: {
    CSectionHeader,
    CSwitch,
    CButton,
    Checkout
  },
  mixins: [SectionTilesProps],
  props: {
    pricingSwitcher: {
      type: Boolean,
      default: false
    },
    pricingSlider: {
      type: Boolean,
      default: false
    }
  },
  // computed() {
  //   return {
  //     plan1PriceId: 'p1.1',
  //   }
  // },
  data() {
    return {
      plan1PriceId: null,
      plan2PriceId: null,
      sectionHeader: {
        title: "Simple, transparent pricing",
        paragraph:
          "Vitae aliquet nec ullamcorper sit amet risus nullam eget felis semper quis lectus nulla at volutpat diam ut venenatis tellus—in ornare."
      },
      priceChangerValue: "0",
      boxesInput: {
        0: "1 to 4 boxes",
        1: "5 to 9 boxes",
        2: "10 to 14 boxes",
        3: "15+ boxes"
      },
      priceOutput: {
        plan1: {
          0: ["$", "35", "/month", "price_1HELZmIkuoCxKwvyONlgxuAo"],
          1: ["$", "35", "/month", "price_1HELZmIkuoCxKwvyONlgxuAo"],
          2: ["$", "35", "/month", "price_1HELZmIkuoCxKwvyONlgxuAo"],
          3: ["$", "contact-us", "/month"]
        },
        plan2: {
          0: ["$", "75", "/month", "price_1HELbkIkuoCxKwvy5ME8KBNg"],
          1: ["$", "90", "/month", "price_1HELbkIkuoCxKwvyQesZrogA"],
          2: ["$", "120", "/month", "price_1HELbkIkuoCxKwvyTAn5dJwL"],
          3: ["$", "contact-us", "/month"]
        }
      }
    };
  },
  methods: {
    handlePricingSlide(e) {
      this.handleSliderValuePosition(e.target);
      this.handlePriceId(e.target.value);
    },
    handlePriceId(planIndex) {
      this.plan1PriceId = this.priceOutput.plan1[planIndex][3];
      this.plan2PriceId = this.priceOutput.plan2[planIndex][3];
      console.log(this.plan1PriceId);
      console.log(this.plan2PriceId);
    },
    handleSliderValuePosition(input) {
      const multiplier = input.value / input.max;
      const thumbOffset = this.thumbSize * multiplier;
      const boxesInputOffset =
        (this.thumbSize - this.$refs.sliderValue.clientWidth) / 2;
      this.$refs.sliderValue.style.left =
        input.clientWidth * multiplier - thumbOffset + boxesInputOffset + "px";
    },
    getPricingData(values, set) {
      return set !== undefined
        ? values[this.priceChangerValue][set]
        : values[this.priceChangerValue];
    }
  },
  mounted() {
    if (this.pricingSlider) {
      this.$refs.slider.setAttribute("min", 0);
      this.$refs.slider.setAttribute(
        "max",
        Object.keys(this.boxesInput).length - 1
      );
      this.thumbSize = parseInt(
        window
          .getComputedStyle(this.$refs.sliderValue)
          .getPropertyValue("--thumb-size"),
        10
      );
      console.log(this.thumbSize);
      this.handleSliderValuePosition(this.$refs.slider);
      this.handlePriceId(0)
    }
  }
};
</script>
