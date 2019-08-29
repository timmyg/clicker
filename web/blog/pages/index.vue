<template>
  <div id="app">
    <Landing />
  </div>
</template>

<script>
import Landing from '~/components/landing/Landing';

export default {
  components: {
    Landing,
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
