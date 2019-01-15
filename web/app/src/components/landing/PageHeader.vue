<template>
  <div class="container has-animations">
    <div class="site-header-inner is-revealing">
      <div class="brand header-brand">
        <span v-scroll-reveal="{ delay: 1350, origin: 'right' }">
          <logo></logo>
        </span>
        <span class="name brand-font" v-scroll-reveal="{ delay: 650, origin: 'top' }">Clicker</span>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from './Logo';

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
}
</style>
