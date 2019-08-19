<template>
  <section class="hero section illustration-section-01 load-hidden">
    <Header />
    <div class="container">
      <div class="hero-inner section-inner">
        <div class="split-wrap">
          <div class="split-item">
            <div class="hero-content split-item-content center-content-mobile">
              <h1 class="mt-0 mb-16" v-scroll-reveal>Let us manage your TVs</h1>
              <p class="m-0 mb-24" v-scroll-reveal="{ delay: 200 , origin: 'left'}">
                <span class="brand-font">Clicker</span> ensures the most relevant local and national sports are on your TVs throughout the day.
              </p>
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
</style>
