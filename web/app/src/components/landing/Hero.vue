<template>
  <div class="container">
    <div class="hero-inner has-animations">
      <div class="hero-copy">
        <h1>Change the game</h1>
        <p
          class="hero-paragraph is-revealing"
          v-scroll-reveal="{ delay: 250 }"
        >Get Clicker at your establishment and allow your patrons to choose the channel they want to watch.</p>
      </div>
      <div
        class="hero-illustration is-revealing"
        v-scroll-reveal="{ delay: 450, origin: 'right', distance: '100px' }"
      >
        <hero-image></hero-image>
      </div>
    </div>
  </div>
</template>

<script>
import HeroImage from './HeroImage';
export default {
  name: 'Hero',
  components: {
    HeroImage,
  },
};
</script>

<style lang="scss" scoped>
</style>

