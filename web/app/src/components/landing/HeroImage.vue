<template>
  <section>
    <div id="bricks">
      <Bricks />
    </div>
    <div
      id="tv-1"
      class="tv"
    >
      <Logo />
    </div>
    <div
      id="tv-2"
      class="tv"
    >
      <Logo />
    </div>
  </section>
</template>

<script>
import Bricks from '../../assets/img/wall.svg';
import Logo from '../../assets/img/logo-mounted.svg';
export default {
  name: 'HeroImage',
  components: {
    Bricks,
    Logo,
  },
};
</script>

<style lang="scss" scoped>
#bricks {
  position: absolute;
  top: 0;
  left: 0;
}
.tv {
  position: absolute;
  top: 100px;
  svg {
    height: 100px;
  }
  &#tv-1 {
    left: -100px;
  }
  &#tv-2 {
    left: 100px;
  }
}
</style>

