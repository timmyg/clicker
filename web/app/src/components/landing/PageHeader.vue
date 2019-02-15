<template>
  <div class="container">
    <div class="site-header-inner">
      <div class="brand header-brand">
        <span class="logo">
          <Logo />
        </span>
        <span class="name brand-font ">Clicker</span>
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
