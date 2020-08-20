<template>
  <header class="site-header">
    <div class="container">
      <div class="site-header-inner">
        <div
          class="brand"
          v-scroll-reveal.reset="{
            easing: 'cubic-bezier(0.5, 0, 0, 1)',
            distance: '10px',
            origin: 'top',
            rotate: { z: -20 }
          }"
        >
          <a :href="link || '/'">
            <img
              src="https://clicker-brand.s3.amazonaws.com/logo.png"
              width="150"
              alt="Clicker logo"
            />
            <div
              class="subtitle brand-font"
              v-scroll-reveal.reset="{ origin: 'right', delay: 500 }"
            >{{ subtitle }}</div>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  props: ["subtitle", "link"],
  computed: {
    currentRouteName() {
      return this.$route.name;
    }
  },
};
</script>

<style lang="scss" scoped>
header {
  // top: 40px;
  .subtitle {
    text-align: center;
    color: black;
    font-size: 16px;
  }
  a {
    text-decoration: none !important;
    display: block !important;
  }
}
</style>
