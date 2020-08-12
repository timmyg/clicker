<template>
  <section class="features-tiles section center-content">
    <div class="container">
      <div class="features-tiles-inner section-inner">
        <div class="tiles-wrap">
          <div class="tiles-item">
            <div class="tiles-item-inner">
              <div class="features-tiles-item-header">
                <div
                  class="features-tiles-item-image tertiary-color mb-16 reveal-scale-up"
                  data-reveal-container=".tiles-item"
                >
                  <img
                    src="/images/landing/feature-tile-icon-02.svg"
                    alt="Feature tile icon 01"
                  />
                </div>
              </div>
              <div class="features-tiles-item-content">
                <h4
                  class="mt-0 mb-8 reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                >
                  Game Flow AI
                </h4>
                <p
                  class="m-0 text-sm reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                  data-reveal-delay="150"
                >
                  With <span class="brand-font">Game Flow AI</span>, we read
                  live scoreboard data to make sure a close, intriguing game is
                  never turned off just because another game is about to kick
                  off.
                </p>
              </div>
            </div>
          </div>
          <div class="tiles-item">
            <div class="tiles-item-inner">
              <div class="features-tiles-item-header">
                <div
                  class="features-tiles-item-image secondary-color mb-16 reveal-scale-up"
                  data-reveal-container=".tiles-item"
                >
                  <img
                    src="/images/landing/feature-tile-icon-05.svg"
                    alt="Feature tile icon 02"
                  />
                </div>
              </div>
              <div class="features-tiles-item-content">
                <h4
                  class="mt-0 mb-8 reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                >
                  Manual Change Override
                </h4>
                <p
                  class="m-0 text-sm reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                  data-reveal-delay="150"
                >
                  We can't predict what every guest wants to watch. If you put
                  on a game with the traditional remote, we'll turn off our
                  automation to prevent changing over their game.
                </p>
              </div>
            </div>
          </div>
          <div class="tiles-item">
            <div class="tiles-item-inner">
              <div class="features-tiles-item-header">
                <div
                  class="features-tiles-item-image tertiary-color mb-16 reveal-scale-up"
                  data-reveal-container=".tiles-item"
                >
                  <img
                    src="/images/landing/feature-tile-icon-01.svg"
                    alt="Feature tile icon 03"
                  />
                </div>
              </div>
              <div class="features-tiles-item-content">
                <h4
                  class="mt-0 mb-8 reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                >
                  Custom Scheduling
                </h4>
                <p
                  class="m-0 text-sm reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                  data-reveal-delay="150"
                >
                  We'll work closely with you to ensure you stay on brand by
                  understanding your venue's sports preferences and the
                  atmosphere you want to cultivate and preserve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.tiles-item .features-tiles-item-header img {
  border-radius: 100px;
  background: rgb(0, 145, 234);
}
.tiles-item:nth-child(1) .features-tiles-item-header img {
  background: radial-gradient(
    circle,
    rgba(0, 145, 234, 1) 49%,
    rgba(85, 195, 245, 1) 78%
  );
}
.tiles-item:nth-child(2) .features-tiles-item-header img {
  background: radial-gradient(
    circle,
    rgba(0, 145, 234, 1) 0%,
    rgba(85, 195, 245, 1) 35%
  );
}
.tiles-item:nth-child(3) .features-tiles-item-header img {
  background: radial-gradient(
    circle,
    rgba(73, 188, 243, 1) 23%,
    rgba(0, 145, 234, 1) 75%
  );
}
</style>
