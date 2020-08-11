<template>
  <section class="pricing section illustration-section-03">
    <div class="container">
      <div class="pricing-inner section-inner">
        <div class="section-header center-content invert-color">
          <div class="container-xs">
            <h2 class="m-0" v-scroll-reveal>Simple packages</h2>
          </div>
        </div>
        <div class="tiles-wrap illustration-section-07">
          <div
            class="tiles-item reveal-scale-up"
            v-scroll-reveal="{ delay: 0, origin: 'bottom' }"
          >
            <div class="tiles-item-inner has-shadow">
              <div class="pricing-item-content">
                <div class="pricing-item-header pb-16 mb-24">
                  <div class="pricing-item-price mb-4">
                    <span class="pricing-item-price-currency h5 text-color-low"
                      >&nbsp;</span
                    >
                    <span class="pricing-item-price-amount h4">&nbsp;</span>
                    <span class="text-color-low text-xs">&nbsp;</span>
                    <span class="pricing-item-name brand-font h5"
                      >Assistant Coach</span
                    >
                  </div>
                </div>
                <div class="pricing-item-features mb-40">
                  <div
                    class="pricing-item-features-title fw-500 text-xs text-color-high"
                  >
                    <b>What's included</b>
                  </div>
                  <ul
                    class="pricing-item-features-list list-reset text-xs mb-32"
                  >
                    <li class="is-checked">
                      <span>
                        Your venue added to
                        <b class="brand-font">Clicker TV</b> app
                      </span>
                    </li>
                    <li class="is-checked">Allow customer controlled TVs</li>
                    <li class="is-checked">TV layout strategy guidance</li>
                    <li class="is-checked">
                      DirecTV wiring setup, if necessary
                    </li>
                    <li class="is-checked">Email + chat support</li>
                  </ul>
                </div>
              </div>
              <div class="pricing-item-cta mb-8">
                <!-- <a class="button button-primary button-block" href="#signup-form">Learn More</a> -->
                <a
                  class="button button-primary button-block"
                  href="#signup-form"
                  >Learn More</a
                >
              </div>
            </div>
          </div>
          <div
            class="tiles-item reveal-scale-up"
            v-scroll-reveal="{ delay: 200, origin: 'bottom' }"
          >
            <div class="tiles-item-inner has-shadow">
              <div class="pricing-item-content">
                <div class="pricing-item-header pb-16 mb-24">
                  <div class="pricing-item-price mb-4">
                    <span class="pricing-item-price-currency h5 text-color-low"
                      >&nbsp;</span
                    >
                    <span class="pricing-item-price-amount h4">&nbsp;</span>
                    <span class="text-color-low text-xs">&nbsp;</span>
                    <span class="pricing-item-name brand-font h5"
                      >Advanced Scout</span
                    >
                  </div>
                </div>
                <div class="pricing-item-features mb-40">
                  <div
                    class="pricing-item-features-title fw-500 text-xs text-color-high"
                  >
                    <b>What's included</b>
                  </div>
                  <ul
                    class="pricing-item-features-list list-reset text-xs mb-32"
                  >
                    <li class="is-checked">
                      <span>
                        <b class="brand-font">Control Center</b> automatically
                        manages your TVs
                      </span>
                    </li>
                    <li class="is-checked">24 hr/day auto programming</li>
                    <li class="is-checked">
                      Weekly email with upcoming TV sports schedule
                    </li>
                    <li class="is-checked">TV layout strategy guidance</li>
                    <li class="is-checked">
                      DirecTV wiring setup, if necessary
                    </li>
                    <li class="is-checked">Email + chat support</li>
                  </ul>
                </div>
              </div>
              <div class="pricing-item-cta mb-8">
                <a
                  class="button button-primary button-block"
                  href="#signup-form"
                  >Learn More</a
                >
              </div>
            </div>
          </div>
          <div
            class="tiles-item reveal-scale-up"
            v-scroll-reveal="{ delay: 400, origin: 'bottom' }"
          >
            <div class="tiles-item-inner has-shadow">
              <div class="pricing-item-content">
                <div class="pricing-item-header pb-16 mb-24">
                  <div class="pricing-item-price mb-4">
                    <span class="pricing-item-price-currency h5 text-color-low"
                      >&nbsp;</span
                    >
                    <span class="pricing-item-price-amount h4">&nbsp;</span>
                    <span class="text-color-low text-xs">&nbsp;</span>
                    <span class="pricing-item-name brand-font h5"
                      >General Manager</span
                    >
                  </div>
                </div>
                <div class="pricing-item-features mb-40">
                  <div
                    class="pricing-item-features-title fw-500 text-xs text-color-high"
                  >
                    <b>What's included</b>
                  </div>
                  <ul
                    class="pricing-item-features-list list-reset text-xs mb-32"
                  >
                    <li class="is-checked">
                      <span>
                        Everything in
                        <span class="brand-font">Assistant Coach</span> +
                        <span class="brand-font">Advanced Scout</span> packages
                      </span>
                    </li>
                    <li class="is-checked">
                      <span>
                        <b class="brand-font">Control Center</b> and
                        <b class="brand-font">Clicker TV</b> changes on the same
                        TV
                      </span>
                    </li>
                    <li class="is-checked">Email, chat + phone support</li>
                  </ul>
                </div>
              </div>
              <div class="pricing-item-cta mb-8">
                <a
                  class="button button-primary button-block"
                  href="#signup-form"
                  >Learn More</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div><Checkout /></div>
  </section>
</template>

<script>
import Checkout from "@/components/landing/Checkout";

export default {
  components: {
    Checkout
  }
};
</script>

<style lang="scss" scoped>
.pricing-slider-value {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 14px;
  margin-top: -10px;
}
.pricing-item-name {
  float: right;
  margin: 0;
}
.pricing-item-price-currency {
  vertical-align: top;
  padding-right: 2px;
}
ul.pricing-item-features-list li:before {
  display: none;
}
</style>
