<template>
  <div class="body-wrap">
    <div class="basic-layout">
      <Header />
      <section class="main">
        <slot />
      </section>
      <Footer />
    </div>
  </div>
</template>

<script>
import Header from './Header';
import Footer from './Footer';
export default {
  name: 'Analytics',
  components: {
    Header,
    Footer,
  },
};
</script>

<style lang="scss" scoped>
// .main {
//   margin-top: 100px;
// }
</style>
