<template>
  <section class="features-split section illustration-section-05">
    <div class="container">
      <div class="features-split-inner section-inner">
        <div class="split-wrap invert-mobile">
          <div
            class="split-item reveal-scale-up is-revealed"
            v-scroll-reveal="{ delay: 200, origin: 'left' }"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Manager Mode description here</h3>
              <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut et dolore magna aliqua. Ut enim ad
                minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex.
              </p>
            </div>
            <div
              class="split-item-image split-item-image-fill is-3d illustration-element-03"
            >
              <img src="/images/landing/tv-zones.png" alt="TV zones schedule" />
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
            </div>
            <div
              class="split-item-image split-item-image-fill is-3d illustration-element-04"
            >
              <img
                src="/images/landing/wall-tv-zap.png"
                alt="Wall TV with app"
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
            </div>
            <div
              class="split-item-image split-item-image-fill is-3d illustration-element-05"
            >
              <img
                src="/images/landing/wall-tvs-more.png"
                alt="Wall with six tvs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
// html.sr section.features-split {
//   visibility: hidden;
// }
</style>
