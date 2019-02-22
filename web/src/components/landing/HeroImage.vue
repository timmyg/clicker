<template>
  <div class="hero-img-wrapper">
    <div id="tv-1" class="tv col" v-bind:class="{ changing: changing }">
      <TV/>
      <div class="channel">
        <Channel1 v-if="channel === 1"/>
        <Channel2 v-if="channel === 2"/>
        <Channel3 v-if="channel === 3"/>
        <Channel4 v-if="channel === 4"/>
        <Channel5 v-if="channel === 5"/>
        <Channel6 v-if="channel === 6"/>
        <Channel7 v-if="channel === 7"/>
        <Channel8 v-if="channel === 8"/>
        <Channel9 v-if="channel === 9"/>
        <Channel10 v-if="channel === 10"/>
        <Channel11 v-if="channel === 11"/>
        <Channel12 v-if="channel === 12"/>
        <Channel13 v-if="channel === 13"/>
        <Channel14 v-if="channel === 14"/>
        <Channel15 v-if="channel === 15"/>
        <Channel16 v-if="channel === 16"/>
        <Channel17 v-if="channel === 17"/>
        <Channel18 v-if="channel === 18"/>
        <Channel19 v-if="channel === 19"/>
        <Channel20 v-if="channel === 20"/>
        <Channel21 v-if="channel === 21"/>
        <div class="tv-static"></div>
      </div>
    </div>
    <div id="phone-wrapper" class="col load-hiddenXX">
      <transition name="fadeUp">
        <FunnelIcon id="zap" v-show="changing"/>
      </transition>
      <div v-scroll-reveal.reset="{ duration: 800, delay: 150, origin: 'bottom', distance: '10px'}">
        <Phone v-on:click="clickerClick()" id="phone"/>
      </div>
      <div
        id="change"
        class="shake"
        v-scroll-reveal.reset="{ duration: 1400, delay: 150, origin: 'right', distance: '10px'}"
      >
        <div class="text">Tap here to see how it works</div>
        <RightIcon/>
      </div>
    </div>
  </div>
</template>

<script>
import Bricks from '../../assets/img/hero/wall.svg';
import TV from '../../assets/img/hero/tv-mounted.svg';
import Phone from '../../assets/img/hero/phone-hand.svg';
import FunnelIcon from 'vue-ionicons/dist/md-funnel.vue';
import RightIcon from 'vue-ionicons/dist/ios-return-right.vue';
import Channel1 from '../../assets/img/hero/channels/024-tactics.svg';
import Channel2 from '../../assets/img/hero/channels/020-stadium.svg';
import Channel3 from '../../assets/img/hero/channels/014-red-card.svg';
import Channel4 from '../../assets/img/hero/channels/037-baseball.svg';
import Channel5 from '../../assets/img/hero/channels/033-soccer.svg';
import Channel6 from '../../assets/img/hero/channels/001-golf.svg';
import Channel7 from '../../assets/img/hero/channels/027-foam-hand.svg';
import Channel8 from '../../assets/img/hero/channels/017-hockey-sticks.svg';
import Channel9 from '../../assets/img/hero/channels/016-helmet.svg';
import Channel10 from '../../assets/img/hero/channels/003-race-horse.svg';
import Channel11 from '../../assets/img/hero/channels/022-basketball.svg';
import Channel12 from '../../assets/img/hero/channels/021-soccer.svg';
import Channel13 from '../../assets/img/hero/channels/037-tennis.svg';
import Channel14 from '../../assets/img/hero/channels/009-trophy.svg';
import Channel15 from '../../assets/img/hero/channels/005-car-1.svg';
import Channel16 from '../../assets/img/hero/channels/007-boxing.svg';
import Channel17 from '../../assets/img/hero/channels/050-american-football.svg';
import Channel18 from '../../assets/img/hero/channels/048-trophy.svg';
import Channel19 from '../../assets/img/hero/channels/044-baseball-helmet.svg';
import Channel20 from '../../assets/img/hero/channels/002-goal-post.svg';
import Channel21 from '../../assets/img/hero/channels/016-punching-ball.svg';
export default {
  name: 'HeroImage',
  components: {
    Bricks,
    TV,
    Phone,
    FunnelIcon,
    RightIcon,
    Channel1,
    Channel2,
    Channel3,
    Channel4,
    Channel5,
    Channel6,
    Channel7,
    Channel8,
    Channel9,
    Channel10,
    Channel11,
    Channel12,
    Channel13,
    Channel14,
    Channel15,
    Channel16,
    Channel17,
    Channel18,
    Channel19,
    Channel20,
    Channel21,
  },
  data() {
    return {
      channel: null,
      changing: false,
    };
  },
  mounted() {
    this.changeChannel();
  },
  methods: {
    changeChannel() {
      this.changing = true;
      this.channel = this.getRandom();
      setTimeout(() => {
        this.changing = false;
      }, 300);
    },
    getRandom() {
      const channels = 21;
      let random = Math.floor(Math.random() * channels) + 1;
      if (random !== this.channel) {
        return random;
      } else {
        return this.getRandom();
      }
    },
    clickerClick() {
      console.log('click');
      this.changeChannel();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/scss/custom/static';
.hero-img-wrapper {
  display: flex;
  justify-content: center;
}
.col {
  position: relative;
  flex: 1;
}
.tv {
  position: absolute;
  svg {
    height: 250px;
    max-width: none;
  }
  &.changing {
    .tv-static {
      visibility: visible;
    }
  }
  &:not(.changing) {
    .tv-static {
      visibility: hidden;
    }
  }
  &#tv-1 {
    top: 40%;
    height: 200px;
    .channel {
      right: 65px;
    }
  }
  .channel {
    top: 81px;
    height: 91px;
    width: 169px;
    border-radius: 2px;
    position: absolute;
    background: white;
    .normal,
    .tv-static {
      position: absolute;
      height: inherit;
      width: inherit;
      border-radius: 2px;
    }
    svg {
      position: absolute;
      height: 60px;
      top: 13px;
    }
  }
}

div#change {
  font-size: 10px;
  line-height: 10px;
  width: 80px;
  position: absolute;
  left: -70px;
  top: 30px;
  .ion {
    font-size: 20px;
  }
}

#phone-wrapper {
  position: absolute;
  top: 540px;
  #phone {
    padding-left: 20px;
    width: inherit;
    svg {
      height: 600px;
      widows: inherit;
    }
    opacity: 0.8;
    &:hover {
      opacity: 1;
      cursor: pointer;
    }
  }
  #zap {
    position: absolute;
    top: -20px;
    width: 100px;
    left: 0px;
    color: blue;
  }
  svg {
    height: 100px;
  }
}

.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  animation-iteration-count: 3;
  animation-delay: 2s;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(1px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-2px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(2px, 0, 0);
  }
}

@include media('>medium') {
  .tv#tv-1 {
    top: -40px;
  }
  #phone-wrapper {
    top: 220px;
  }
}
</style>