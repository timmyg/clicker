<template>
  <section class="wrapper">
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
    <div
      id="channel-1"
      class="channel"
    >
      <ChannelBaseball />
      <ChannelBasketball />
      <ChannelSoccer />
      <ChannelTennis />
      <ChannelTrophy />
    </div>
    <div
      id="channel-2"
      class="channel"
    >
      <ChannelBaseball />
      <ChannelBasketball />
      <ChannelSoccer />
      <ChannelTennis />
      <ChannelTrophy />
    </div>
    <div id="phone">
      <Phone />
    </div>
    <div
      id="screen-1"
      class="screen tv-static "
    ></div>
    <div
      id="screen-1"
      class="screen tv-static "
    ></div>
  </section>
</template>

<script>
import Bricks from '../../assets/img/hero/wall.svg';
import Logo from '../../assets/img/hero/tv-mounted.svg';
import Phone from '../../assets/img/hero/phone-hand.svg';
import ChannelBaseball from '../../assets/img/hero/channels/baseball.svg';
import ChannelBasketball from '../../assets/img/hero/channels/basketball.svg';
import ChannelSoccer from '../../assets/img/hero/channels/soccer.svg';
import ChannelTennis from '../../assets/img/hero/channels/tennis.svg';
import ChannelTrophy from '../../assets/img/hero/channels/trophy.svg';
export default {
  name: 'HeroImage',
  components: {
    Bricks,
    Logo,
    Phone,
    ChannelBaseball,
    ChannelBasketball,
    ChannelSoccer,
    ChannelTennis,
    ChannelTrophy,
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/scss/custom/static';
.tv {
  position: absolute;
  top: -30px;
  svg {
    height: 200px;
  }
  &#tv-1 {
    left: -40px;
  }
  &#tv-2 {
    left: 220px;
  }
}
#phone {
  position: absolute;
  bottom: -110px;
  svg {
    height: 200px;
  }
}
.channel {
  top: -30px;
  svg {
    height: 60px;
    position: absolute;
    top: 40px;
  }
  &#channel-1 {
    svg {
      left: -40px;
    }
  }
  &#channel-2 {
    svg {
      left: 220px;
    }
  }
}
.screen {
  height: 50px;
  width: 100px;
}
</style>

