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
            >
              {{ subtitle }}
            </div>
          </a>
        </div>
        <SlideMenu right noOverlay>
          <a href="/"> <span>Home</span> </a>
          <a href="/#pricing"> <span>Pricing</span> </a>
          <a href="/control-center"> <span>Control Center</span> </a>
          <a href="/clicker-tv/staff"> <span>Clicker TV for Staff</span> </a>
          <a href="/clicker-tv/guests"> <span>Clicker TV for Guests</span> </a>
          <a href="/blog"> <span>Blog</span> </a>
          <a href="/faq"> <span>FAQ</span> </a>
          <a href="/setup"> <span>Setup</span> </a>
          <a href="/support"> <span>Support</span> </a>
        </SlideMenu>
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
  data() {
    return {
      isOpen: false
    };
  },
  methods: {
    toggleMenu() {}
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
  }
  a {
    text-decoration: none !important;
    display: block !important;
  }
}
</style>

<style lang="scss">
.bm-menu {
  transition: 0.01s !important;
}
</style>
