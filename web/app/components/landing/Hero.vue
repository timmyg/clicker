<template>
  <section class="hero section illustration-section-01">
    <Header />
    <div class="container">
      <div class="hero-inner section-inner">
        <div class="split-wrap">
          <div class="split-item">
            <div class="hero-content split-item-content center-content-mobile">
              <h1 class="mt-0 mb-16" v-scroll-reveal>
                You pay a lot for DirecTV.
                <br />Let's Maximize it.
              </h1>
              <p
                class="m-0 mb-24"
                v-scroll-reveal="{ delay: 200 , origin: 'left'}"
              >We guarantee the most compelling local and national sports are always on your TVs, and take that responsibility away your from staff.</p>
              <div v-scroll-reveal="{ delay: 400 }">
                <a class="button button-primary button-wide-mobile" href="#signup-form">Learn More</a>
              </div>
            </div>
            <div
              class="hero-figure is-3d split-item-image split-item-image-fill illustration-element-01"
              v-scroll-reveal="{ scale: .9}"
            >
              <img src="/images/landing/wall-tvs.png" alt="Wall with three tvs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Header from '@/components/layouts/Header';
export default {
  components: { Header },
};
</script>

<style lang="scss" scoped>
.hero div.hero-inner {
  padding-top: 96px;
}

// > large
@media (min-width: 820px) {
  .container .split-wrap .split-item {
    .split-item-content {
      width: 588px;
    }
  }
}
</style>

