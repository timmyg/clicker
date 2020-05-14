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
              <h3 class="mt-0 mb-16">Right Game, Right TV, All the Time</h3>
              <p class="m-0">
                Your guests are hard to predict, and your bartenders are easily distracted. With
                <b
                  class="brand-font"
                >Control Center</b>, we'll handle the TV changes behind the scenes and put the best
                sports on your TVs throughout the day - without your staff having to lift a finger.
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-03">
              <img src="/images/landing/tv-zones.png" alt="TV zones schedule" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200, origin: 'right' }">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Empower Your Guests to Change the Game</h3>
              <p class="m-0">
                After downloading the
                <b class="brand-font">Clicker TV</b> app, your guests can choose the sports they want to watch and
                change the channel instantly from their phone.
                Check it out on
                <a
                  href="https://apps.apple.com/us/app/clicker-tv/id1471666907"
                  target="_blank"
                >iOS</a> and
                <a
                  href="https://play.google.com/store/apps/details?id=com.teamclicker.app"
                  target="_blank"
                >Android</a>.
              </p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-04">
              <img src="/images/landing/wall-tv-zap.png" alt="Wall TV with app" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200, origin: 'left' }">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Custom Scheduling</h3>
              <p class="m-0">
                Soccer bar? Notre Dame bar? Every venue is different. We'll work closely with you to ensure your
                programming aligns with your bar's preferences. We'll consider local, national, and live game-flow appeal.
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
