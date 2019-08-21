<template>
  <section class="features-split section illustration-section-05">
    <div class="container">
      <div class="features-split-inner section-inner">
        <div class="section-header center-content">
          <div class="container-xs" v-scroll-reveal>
            <h2 class="mt-0 mb-16">We'll take care of it</h2>
            <p>
              Clicker provides two products:
              <b class="brand-font">Control Center</b> automatically manages the majority of your TVs, while the
              <b
                class="brand-font"
              >Clicker TV</b> app lets your guests change channels from their phone.
            </p>
          </div>
        </div>
        <div class="split-wrap invert-mobile">
          <div
            class="split-item reveal-scale-up is-revealed"
            v-scroll-reveal="{ delay: 200 , origin: 'left'}"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Right Game, Right TV, Right Time</h3>
              <p class="m-0">
                With
                <b class="brand-font">Control Center</b>, we'll work closely to learn your location's sports preferences and put those on your TVs throughout the day - without your staff having to lift a finger.
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-03">
              <img src="/images/landing/tv-zones.png" alt="TV zones schedule" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200 , origin: 'right'}">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Empower Your Guests to Change the Game</h3>
              <p class="m-0">
                After downloading the
                <b class="brand-font">Clicker TV</b> app, your guests can choose the sports they want to watch and change the channel instantly from their phone.
                <a
                  href="http://onelink.to/thxs9v"
                  target="_blank"
                >Check it out</a>.
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-04">
              <img src="/images/landing/wall-tv-zap.png" alt="Wall TV with app" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200 , origin: 'left'}">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Just the Right Mix</h3>
              <p class="m-0">
                Every location is different. We recommend
                <b class="brand-font">Control Center</b> on a majority of your TVs, while enabling
                <b class="brand-font">Clicker TV</b> on a few.
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-05">
              <img src="/images/landing/wall-tvs-more.png" alt="Wall with six tvs" />
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