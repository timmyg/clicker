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
                    src="/images/theme/feature-tile-icon-01.svg"
                    alt="Feature tile icon 01"
                  />
                </div>
              </div>
              <div class="features-tiles-item-content">
                <h4
                  class="mt-0 mb-8 reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                >
                  Eliminate Touch Points
                </h4>
                <p
                  class="m-0 text-sm reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                  data-reveal-delay="150"
                >
                  With employees using their own smartphones to change the
                  channels, we limit the amount of touches to a common remote.
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
                  Find Games Easier
                </h4>
                <p
                  class="m-0 text-sm reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                  data-reveal-delay="150"
                >
                  We display all sports channels and programs to make finding
                  the right game easy.
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
                  Manual Override
                </h4>
                <p
                  class="m-0 text-sm reveal-from-bottom"
                  data-reveal-container=".tiles-item"
                  data-reveal-delay="150"
                >
                  We can't predict what every guest wants to watch - override
                  the Control Center automation and lock that game on TV through
                  it's conclusion.
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
