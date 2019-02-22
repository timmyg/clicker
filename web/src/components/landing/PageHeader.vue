<template>
  <div class="container load-hidden">
    <div class="site-header-inner">
      <div class="brand header-brand">
        <span class="logo" v-scroll-reveal.reset="{ duration: 400, delay: 650, origin: 'right', distance: '10px', easing: 'cubic-bezier(.17,.67,.83,.67)'}">
            <Logo />
        </span>
        <span class="name brand-font" v-scroll-reveal.reset="{ duration: 200, delay: 250, origin: 'left', distance: '10px', easing: 'cubic-bezier(.17,.67,.83,.67)'}">
          Clicker
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '../../assets/img/logo.svg';

export default {
  name: 'PageHeader',
  components: {
    Logo,
  },
};
</script>

<style lang="scss" scoped>
.brand {
  display: flex;
  align-items: inherit;
  .name {
    font-size: 34px;
    padding: 4px 6px;
  }
  .logo svg {
    height: 60px;
  }
}
</style>
