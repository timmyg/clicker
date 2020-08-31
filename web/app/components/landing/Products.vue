<template>
  <section class="features-split section illustration-section-05">
    <div class="container">
      <!-- <h2 class="center-content products-header pt-32 mb-0">
        Clicker Offers three distinct products
      </h2>-->
      <div class="features-split-inner section-inner">
        <div class="split-wrap invert-mobile">
          <div
            class="split-item reveal-scale-up is-revealed"
            v-scroll-reveal="{ delay: 200, origin: 'left' }"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">📱 Contactless Remote Control</h3>
              <p class="m-0">
                <b class="brand-font">Clicker TV for Staff</b> reduces the spread of germs through the elimination of a shared remote.
                <br />
                <nuxt-link to="/products/clicker-tv/staff">
                  Learn more about
                  <span class="brand-font">Clicker TV for Staff</span> →
                </nuxt-link>
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-03">
              <img
                src="/images/landing/illustrations/undraw-manager-2.svg"
                alt="TVs on wall drawing"
              />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200, origin: 'right' }">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">🤯 Blow your Guests' Minds</h3>
              <p class="m-0">
                <b class="brand-font">Clicker TV for Guests</b> allows guests to reserve TVs and
                change channels from an app, giving them an unforgettable
                experience.
                <br />
                <nuxt-link to="/products/clicker-tv/guests">
                  Learn more about
                  <span class="brand-font">Clicker TV for Guests</span> →
                </nuxt-link>
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-04">
              <img src="/images/landing/illustrations/undraw-app-2.svg" alt="Mobile phone drawing" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200, origin: 'left' }">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">
                😌 Sports TV
                <em>Nirvana</em>
              </h3>
              <p class="m-0">
                <b class="brand-font">Control Center</b> manages all your TVs behind the scenes, so
                your staff can focus on the guest experience.
                <br />
                <nuxt-link to="/products/control-center">
                  Learn more about
                  <span class="brand-font">Control Center</span> →
                </nuxt-link>
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-05">
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

<style lang="scss" scoped>
p {
  line-height: 34px;
}
</style>