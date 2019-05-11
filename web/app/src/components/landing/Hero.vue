<template>
  <div class="container">
    <div class="flex-grid wrapper">
      <div class="hero-copy col">
        <h1 class="listen-up">
          Change the game.
          <br>Literally.
        </h1>
        <p
          class="hero-paragraph"
        >Empower guests at your bar or restaurant to change the channel easily from their phone.</p>
        <signup></signup>
      </div>
      <div class="hero-illustration col">
        <!-- <div class="flex-grid img-wrapper"> -->
        <hero-image></hero-image>
        <!-- </div> -->
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
.wrapper {
  flex-direction: column;
}
.img-wrapper {
  justify-content: center;
}
.hero-illustration {
  background-image: url(/img/wall.svg);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position-y: 20px;
  height: 360px;
  flex: 1 auto;
}

@include media('>large') {
  .hero > div {
    min-height: 350px;
  }
  .hero-illustration {
    background-image: url(/img/wall-sm.svg);
    background-position-y: 0px;
    height: inherit;
  }
  .hero-paragraph {
    margin-bottom: 32px;
    max-width: 380px;
  }
}
@include media('>small') {
  .hero-copy {
    text-align: left;
    padding-right: 30px;
  }
}

@include media('<medium') {
  .mobile-break {
    display: inline-block;
  }
}
</style>
