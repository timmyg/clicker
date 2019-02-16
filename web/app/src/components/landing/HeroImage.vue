<template>
  <section class="wrapper">
    <div id="bricks">
      <Bricks />
    </div>
    <div id="tv-1" class="tv">
      <TV />
      <div class="channel">
        <ChannelBaseball />
        <ChannelBasketball />
        <ChannelSoccer />
        <ChannelTennis />
        <ChannelTrophy />
        <div class="normal"></div>
        <div class="tv-static"></div>
      </div>
    </div>
    <div id="tv-2" class="tv">
      <TV />
      <div class="channel">
        <ChannelBaseball />
        <ChannelBasketball />
        <ChannelSoccer />
        <ChannelTennis />
        <ChannelTrophy />
        <div class="normal"></div>
        <div class="tv-static"></div>
      </div>
    </div>
    <div id="phone">
      <Phone />
    </div>
  </section>
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
            left: -130px;
            .channel {
                left: 196px;
                svg {
                    left: -193px;;
                }
            }
        }
        &#tv-2 {
            left: 170px;
            .channel {
                left: 196px;
                svg {
                    left: 93px;
                }
            }
        }
        .channel {
            top: 65px;
            height: 74px;
            width: 135px;
            border-radius: 40px;
            position: absolute;
            top: 34px;
            .normal,
            .tv-static {
                position: absolute;
                height: inherit;
                width: inherit;
                border-radius: 2px;
            }
            .normal {
                background: white;
            }
            svg {
                position: absolute;
                height: 100px;
            }
        }
    }
    
    #phone {
        position: absolute;
        bottom: 5px;
        left: 30px;
        svg {
            height: 100px;
        }
    }
    
    
    // .screen {

        // &#screen-1 {
        //     left: 67px;
        // }
        // &#screen-2 {
        //     left: 367px;
        // }
        // .normal,
        // .tv-static {
        //     position: absolute;
        //     height: inherit;
        //     width: inherit;
        //     border-radius: 2px;
        // }
        // .normal {
        //     background: white;
        // }
    // }
</style>