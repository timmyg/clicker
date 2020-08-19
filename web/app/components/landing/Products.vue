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
              <h3 class="mt-0 mb-16">🔧 Empower Your Staff</h3>
              <p class="m-0">
                <b>Clicker TV for Staff</b> lets your staff download an app to
                manage the TVs to enhance the guest experience and reduce
                friction.
                <br />
                <nuxt-link to="/clicker-tv/staff">Learn more about Clicker TV for Staff →</nuxt-link>
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-03">
              <img
                src="/images/landing/illustrations/undraw-manager-mode.svg"
                alt="TVs on wall drawing"
              />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200, origin: 'right' }">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">🤯 Blow your Guests Minds</h3>
              <p class="m-0">
                <b>Clicker TV for Guests</b> allows guests to reserve TVs and
                change channels from an app, giving them a unique experience
                they will never forget.
              </p>
              <br />
              <nuxt-link to="/clicker-tv/guests">Learn more about Clicker TV for Guests →</nuxt-link>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-04">
              <img src="/images/landing/illustrations/undraw-app.svg" alt="Mobile phone drawing" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200, origin: 'left' }">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">
                😌 Sports TV
                <em>Nirvana</em>
              </h3>
              <p class="m-0">
                <b>Control Center</b> manages all your TVs behing the scenes, so
                you staff can focus on the guest experience.
              </p>
              <br />
              <nuxt-link to="/control-center">Learn more about Control Center →</nuxt-link>
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
