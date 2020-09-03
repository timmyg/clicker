<template>
  <section class="hero section illustration-section-01">
    <Header />
    <div class="container">
      <div class="hero-inner section-inner">
        <div class="split-wrap">
          <div class="split-item">
            <div class="hero-content split-item-content center-content-mobile">
              <h2 class="mt-0 mb-16 header">
                <span>The Biggest Sports Moments on Your TVs.</span>
                <!-- <br /> -->
                <span class="reversed">Guaranteed.</span>
              </h2>
              <p class="m-0 mb-24">
                <span class="brand-font">Clicker</span> is a sports-centric
                DIRECTV add-on that drives improved ROI from your existing TV
                and sports packages.
              </p>
              <div>
                <SignupForm />
              </div>
            </div>
            <div
              class="hero-figure is-3d split-item-image split-item-image-fill illustration-element-01"
            >
              <img src="/images/landing/hero/fans-bar.jpg" alt="Crowded bar with tvs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Header from "@/components/layouts/Header";
import SignupForm from "@/components/landing/SignupForm";
export default {
  components: { Header, SignupForm }
};
</script>

<style lang="scss" scoped>
.hero {
  .hero-content {
    z-index: 1;
  }
  div.hero-inner {
    padding-top: 96px;
  }
}
.reversed {
  background: black;
  color: white;
  padding: 4px 8px;
  line-height: 1.5em;
}

// > large
@media (min-width: 820px) {
  .container .split-wrap .split-item {
    .split-item-content {
      width: 528px;
    }
  }
}
.header {
  font-weight: 400;
}
</style>
