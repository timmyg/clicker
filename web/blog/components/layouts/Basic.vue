<template>
  <div class="body-wrap">
    <div class="basic-layout">
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
  name: 'Basic',
  components: {
    Header,
    Footer,
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto|Saira');

* {
  font-family: 'Roboto', sans-serif;
}

.brand-font {
  font-family: 'Saira', sans-serif !important;
}

#app {
  color: #2c3e50;
  height: 100%;
}

html,
body {
  margin: 0;
  height: 100%;
  font-family: 'Raleway', sans-serif;
}

ul,
li {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
