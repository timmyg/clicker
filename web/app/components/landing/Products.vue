<template>
  <section class="features-split section illustration-section-05">
    <div class="container">
      <!-- <h2 class="center-content products-header pt-32 mb-0">
        Clicker Offers three distinct products
      </h2> -->
      <div class="features-split-inner section-inner">
        <div class="split-wrap invert-mobile">
          <div
            class="split-item reveal-scale-up is-revealed"
            v-scroll-reveal="{ delay: 200, origin: 'left' }"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Manager description here</h3>
              <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut et dolore magna aliqua. Ut enim ad
                minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex. <br />
                <nuxt-link to="/manager">Learn more</nuxt-link>
              </p>
            </div>
            <div
              class="split-item-image split-item-image-fill is-3d illustration-element-03"
            >
              <img
                src="/images/landing/illustrations/undraw-manager-mode.svg"
                alt="TVs on wall drawing"
              />
            </div>
          </div>
          <div
            class="split-item reveal-scale-up"
            v-scroll-reveal="{ delay: 200, origin: 'right' }"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Clicker TV description here</h3>
              <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut et dolore magna aliqua. Ut enim ad
                minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex.
              </p>
              <br />
              <nuxt-link to="/clicker-tv">Learn more</nuxt-link>
            </div>
            <div
              class="split-item-image split-item-image-fill is-3d illustration-element-04"
            >
              <img
                src="/images/landing/illustrations/undraw-app.svg"
                alt="Mobile phone drawing"
              />
            </div>
          </div>
          <div
            class="split-item reveal-scale-up"
            v-scroll-reveal="{ delay: 200, origin: 'left' }"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Control Center here</h3>
              <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut et dolore magna aliqua. Ut enim ad
                minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex.
              </p>
              <br />
              <nuxt-link to="/control-center">Learn more</nuxt-link>
            </div>
            <div
              class="split-item-image split-item-image-fill is-3d illustration-element-05"
            >
              <img
                src="/images/landing/illustrations/undraw-control-center.svg"
                alt="Wall with tvs drawing"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
