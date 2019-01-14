<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto|Saira');

* {
  font-family: 'Roboto', sans-serif;
}

.brand-font {
  font-family: 'Saira', sans-serif;
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
