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
        <!-- <c-section-header :data="sectionHeader" class="center-content" /> -->
        <h2 class="center-content pricing-header">Simple Pricing</h2>
        <div v-if="pricingSwitcher" class="pricing-switcher center-content">
          <c-switch
            v-model="priceChangerValue"
            true-value="1"
            false-value="0"
            right-label="Billed Annually"
            >Billed Monthly</c-switch
          >
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
          <p ref="sliderValue" class="pricing-slider-value">
            {{ getPricingData(boxesInput) }} boxes
          </p>
        </div>
        <div class="tiles-wrap" :class="[pushLeft && 'push-left']">
          <div class="tiles-item reveal-from-bottom">
            <div class="tiles-item-inner has-shadow">
              <div class="pricing-item-content">
                <div class="pricing-item-header pb-24 mb-24">
                  <div class="pricing-item-name">
                    <span class="name manager-mode">Manager Only</span>
                  </div>
                  <div class="pricing-item-price mb-8">
                    <div
                      v-if="
                        getPricingData(this.priceOutput.plan1, 1) ===
                          'contact-us'
                      "
                    >
                      <span class="pricing-item-price-amount h2"
                        >Let's Talk!</span
                      >
                    </div>
                    <div v-else>
                      <span class="pricing-item-price-currency h3">
                        {{ getPricingData(this.priceOutput.plan1, 0) }}
                      </span>
                      <span class="pricing-item-price-amount h1">
                        {{ getPricingData(this.priceOutput.plan1, 1) }}
                      </span>
                      <span class="pricing-item-price-amount text-sm">
                        {{ getPricingData(this.priceOutput.plan1, 2) }}
                      </span>
                    </div>
                  </div>
                  <div class="text-xs text-color-low">
                    Allow staff to manage TVs from their phone
                  </div>
                </div>
                <div class="pricing-item-features mb-40">
                  <div
                    class="pricing-item-features-title h6 text-xs text-color-high mb-0"
                  >
                    What’s included
                  </div>
                  <ul
                    class="pricing-item-features-list list-reset text-xs mb-32"
                  >
                    <li class="is-checked">30 days free</li>
                    <li class="is-checked">
                      Staff can change TV channel with
                      <a
                        href="/blog/manage-tvs-from-your-phone-with-manager-mode"
                      >
                        Manager Mode</a
                      >
                    </li>
                    <li class="is-checked">
                      Integrates with all your DIRECTV Boxes
                    </li>
                  </ul>
                </div>
              </div>
              <div class="pricing-item-cta mb-8">
                <div class="pt-16"><Checkout :priceId="plan1PriceId" /></div>
              </div>
            </div>
          </div>

          <div class="tiles-item reveal-from-bottom" data-reveal-delay="200">
            <div class="tiles-item-inner has-shadow">
              <div class="pricing-item-content">
                <div class="pricing-item-header pb-24 mb-24">
                  <div class="pricing-item-name">
                    <span class="name all-star">All-Star</span>
                  </div>
                  <div class="pricing-item-price mb-8">
                    <div
                      v-if="
                        getPricingData(this.priceOutput.plan2, 1) ===
                          'contact-us'
                      "
                    >
                      <span class="pricing-item-price-amount h2"
                        >Let's Talk!</span
                      >
                    </div>
                    <div v-else>
                      <span class="pricing-item-price-currency h3">
                        {{ getPricingData(this.priceOutput.plan2, 0) }}
                      </span>
                      <span class="pricing-item-price-amount h1">
                        {{ getPricingData(this.priceOutput.plan2, 1) }}
                      </span>
                      <span class="pricing-item-price-amount text-sm">
                        {{ getPricingData(this.priceOutput.plan2, 2) }}
                      </span>
                    </div>
                  </div>
                  <div class="text-xs text-color-low">
                    Clicker TV and Control Center, fully loaded
                  </div>
                </div>
                <div class="pricing-item-features mb-40">
                  <div
                    class="pricing-item-features-title h6 text-xs text-color-high mb-0"
                  >
                    What’s included
                  </div>
                  <ul
                    class="pricing-item-features-list list-reset text-xs mb-32"
                  >
                    <li class="is-checked">30 days free</li>
                    <li class="is-checked">Everything in Manager Package</li>
                    <li class="is-checked">
                      Control Center - automated channel changes
                    </li>
                    <li class="is-checked">
                      Custom channel changes based on venue preferences
                    </li>
                    <li class="is-checked">
                      Clicker TV to allow guests to change channels
                    </li>
                    <li class="is-checked">
                      VIP Mode allowing only certain guests to change channels
                    </li>
                    <li class="is-checked">
                      Integrates with {{ getPricingData(boxesInput) }} DIRECTV
                      Boxes
                    </li>
                  </ul>
                </div>
              </div>
              <div class="pricing-item-cta mb-8">
                <div class="pt-16"><Checkout :priceId="plan2PriceId" /></div>
              </div>
            </div>
          </div>
        </div>
        <div class="center-content text-xs text-color-low">
          Risk free. Cancel anytime.
        </div>
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
  data() {
    return {
      plan1PriceId: null,
      plan2PriceId: null,
      sectionHeader: {
        title: "Simple pricing"
      },
      priceChangerValue: "0",
      boxesInput: {
        0: "1 to 4",
        1: "5 to 9",
        2: "10 to 14",
        3: "15+"
      },
      priceOutput: {
        plan1: {
          0: ["$", "35", "/month", process.env.NUXT_ENV_STRIPE_PRICE_MANAGER],
          1: ["$", "35", "/month", process.env.NUXT_ENV_STRIPE_PRICE_MANAGER],
          2: ["$", "35", "/month", process.env.NUXT_ENV_STRIPE_PRICE_MANAGER],
          3: ["$", "contact-us", "/month"]
        },
        plan2: {
          0: [
            "$",
            "75",
            "/month",
            process.env.NUXT_ENV_STRIPE_PRICE_ALLSTAR_TIER_1
          ],
          1: [
            "$",
            "90",
            "/month",
            process.env.NUXT_ENV_STRIPE_PRICE_ALLSTAR_TIER_2
          ],
          2: [
            "$",
            "120",
            "/month",
            process.env.NUXT_ENV_STRIPE_PRICE_ALLSTAR_TIER_3
          ],
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
      this.handleSliderValuePosition(this.$refs.slider);
      this.handlePriceId(0);
    }
  }
};
</script>

<style lang="scss" scoped>
.pricing-item-price {
  min-height: 60px;
}
.pricing-item-name {
  position: absolute;
  right: -10px;
  top: -20px;
  .name {
    text-transform: uppercase;
    font-size: 12px;
    border-radius: 4px;
    padding: 4px 8px;
    color: #fff;
    font-weight: bold;
    &.manager-mode {
      background: #55c3f5;
    }
    &.all-star {
      background: #0091ea;
    }
  }
}
.pricing-header {
  margin-bottom: 8px;
}
.pricing-slider-value {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 14px;
  margin-top: -10px;
}

input[type="range"] {
  height: 25px;
  -webkit-appearance: none;
  margin: 10px 0;
  width: 100px;
}
input[type="range"]:focus {
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100px;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: #0091ea;
  border-radius: 1px;
  border: 0px solid #000000;
}
input[type="range"]::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #0091ea;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: #fff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -7px;
}
input[type="range"]:focus::-webkit-slider-runnable-track {
  background: #0091ea;
}
input[type="range"]::-moz-range-track {
  width: 100px;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: #0091ea;
  border-radius: 1px;
  border: 0px solid #000000;
}
input[type="range"]::-moz-range-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #0091ea;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: #fff;
  cursor: pointer;
}
input[type="range"]::-ms-track {
  width: 100px;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type="range"]::-ms-fill-lower {
  background: #0091ea;
  border: 0px solid #000000;
  border-radius: 2px;
  box-shadow: 0px 0px 0px #000000;
}
input[type="range"]::-ms-fill-upper {
  background: #0091ea;
  border: 0px solid #000000;
  border-radius: 2px;
  box-shadow: 0px 0px 0px #000000;
}
input[type="range"]::-ms-thumb {
  margin-top: 1px;
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #0091ea;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: #fff;
  cursor: pointer;
}
input[type="range"]:focus::-ms-fill-lower {
  background: #0091ea;
}
input[type="range"]:focus::-ms-fill-upper {
  background: #0091ea;
}
</style>
