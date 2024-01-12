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
              src="/logo.png"
              width="150"
              alt="Clicker logo"
            />
            <div
              class="subtitle brand-font"
              v-scroll-reveal.reset="{ origin: 'right', delay: 500 }"
            >{{ subtitle }}</div>
          </a>
        </div>
        <div>
          <Dropdown />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import Dropdown from "../landing/Dropdown";
export default {
  props: ['link', 'subtitle'],
  components: {
    Dropdown
  }
};
</script>

<style lang="scss" scoped>
header {
  // top: 40px;
  .subtitle {
    text-align: center;
    color: black;
    font-size: 16px;
    position: absolute;
    left: 50%;
  }
  a {
    text-decoration: none !important;
    display: block !important;
    position: relative;
  }
}
</style>
