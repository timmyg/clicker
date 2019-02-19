<template>
  <div class="hero-img-wrapper">
    <!-- <div id="bricks">
      <Bricks />
    </div> -->
    <div
      id="tv-1"
      class="tv col"
      v-bind:class="{ changing: changing }"
    >
      <TV />
      <div class="channel">
        <ChannelBaseball v-if="channel === 1" />
        <ChannelBasketball v-else-if="channel === 2" />
        <ChannelSoccer v-else-if="channel === 3" />
        <ChannelTennis v-else-if="channel === 4" />
        <ChannelTrophy v-else-if="channel === 5" />
        <div class="tv-static"></div>
      </div>
    </div>
    <div
      id="phone-wrapper"
      class="col"
    >
      <transition name="fadeUp">
        <FunnelIcon
          id="zap"
          v-show="changing"
        />
      </transition>
      <Phone
        v-on:click="clickerClick()"
        id="phone"
      />
    </div>
  </div>
</template>

<script>
    import Bricks from '../../assets/img/hero/wall.svg';
    import TV from '../../assets/img/hero/tv-mounted.svg';
    import Phone from '../../assets/img/hero/phone-hand.svg';
    import ChannelBaseball from '../../assets/img/hero/channels/baseball.svg';
    import ChannelBasketball from '../../assets/img/hero/channels/basketball.svg';
    import ChannelSoccer from '../../assets/img/hero/channels/soccer.svg';
    import ChannelTennis from '../../assets/img/hero/channels/tennis.svg';
    import ChannelTrophy from '../../assets/img/hero/channels/trophy.svg';
    import FunnelIcon from 'vue-ionicons/dist/md-funnel.vue'
    import RightIcon from 'vue-ionicons/dist/ios-return-right.vue'
    export default {
        name: 'HeroImage',
        components: {
            Bricks,
            TV,
            Phone,
            ChannelBaseball,
            ChannelBasketball,
            ChannelSoccer,
            ChannelTennis,
            ChannelTrophy,
            FunnelIcon,
            RightIcon
        },
        data() {
            return {
                channel: null,
                changing: false,
            }
        },
        mounted() {
            this.changeChannel();
        },
        methods: {
            changeChannel() {
                this.changing = true;
                this.channel = this.getRandom();
                setTimeout(()=> {
                    this.changing = false;
                }, 300)
            },
            getRandom() {
                const max = 5;
                let random = Math.floor(Math.random() * max) + 1;
                if (random !== this.channel) {
                    return random
                } else {
                    return this.getRandom();
                }
            },
            clickerClick() {
                console.log("click");
                this.changeChannel();
            }
        }
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
            top: -40px;
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
    
    #phone-wrapper {
        position: absolute;
        // right: 56px;
        top: 200px;
        #phone {
            opacity: .8;
            &:hover {
                opacity: 1;
                cursor: pointer;
            }
        }
        #zap {
            position: absolute;
            left: 140px;
            top: -30px;
            color: lightgrey;
        }
        svg {
            height: 100px;
        }
    }

    @include media('<medium') { 
        .tv#tv-1 {
            top: 283px;
        }
        #phone-wrapper {
            top: 510px;
        }
    }
    
</style>