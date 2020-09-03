<template>
  <div class="body-wrap">
    <div class="basic-layout">
      <section>
        <slot />
      </section>
      <Footer />
    </div>
  </div>
</template>

<script>
import Header from "./Header";
import Footer from "./Footer";
// import Vue from "vue";
// // import VueScrollReveal from "vue-scroll-reveal";
// // Vue.use(VueScrollReveal, {
// //   class: "v-scroll-reveal", // A CSS class applied to elements with the v-scroll-reveal directive; useful for animation overrides.
// //   duration: 800,
// //   scale: 1,
// //   distance: "10px",
// //   mobile: false
// // });
export default {
  name: "Basic",
  components: {
    Header,
    Footer
  }
};
</script>

<style lang="scss">
// @import url("https://fonts.googleapis.com/css?family=Roboto|Saira");

*,
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Roboto", sans-serif;
}

.brand-font {
  font-family: "Saira", sans-serif !important;
}
.brand-font * {
  font-family: "Saira", sans-serif !important;
}

#app {
  color: #373737;
  height: 100%;
}

html,
body {
  margin: 0;
  height: 100%;
  font-family: "Raleway", sans-serif;
}

ul:not(.styled),
li:not(.styled) {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}

main {
  padding-top: 100px;
}

section.main {
  padding-top: 100px;
}
</style>
