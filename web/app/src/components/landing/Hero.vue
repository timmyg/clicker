<template>
  <div class="container">
    <div class="flex-grid">
      <div class="hero-copy col">
        <h1 class="listen-up">Change the game</h1>
        <p class="hero-paragraph">Empower your guests to change the channel simply from their phone.</p>
        <signup></signup>
      </div>
      <div class="hero-illustration col">
        <hero-image></hero-image>
      </div>
    </div>
  </div>
</template>

<script>
import HeroImage from './HeroImage';
import Signup from './Signup';
export default {
  name: 'Hero',
  components: {
    HeroImage,
    Signup,
  },
};
</script>

<style lang="scss" scoped>
.hero-illustration {
  display: flex;
  justify-content: space-between;
  position: relative;
}
</style>

