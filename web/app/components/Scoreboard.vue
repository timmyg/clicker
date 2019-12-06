<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main container">
      <div class="refresh-wrapper text-right">
        <span>
          <a href class="link" v-if="!loading" v-on:click="refresh($event)">refresh</a>
          <a class="link" v-else disabled>refreshing...</a>
        </span>
      </div>
      <div v-for="(games, leagueName) in gamesByLeague" v-bind:key="leagueName" class="league-wrapper">
        <div class="league uppercase text-sm font-bold">{{ leagueName }}</div>
        <div class="flex flex-wrap mb-4">
          <div v-for="game in games" v-bind:key="game.id" class="game w-1/2 md:w-1/3 lg:w-1/4 mb-4 rounded-sm">
            <div class="game-wrapper p-2">
              <div class="flex flex-row status-wrapper justify-between text-sm">
                <div>
                  <span v-if="game.broadcast">{{ game.broadcast.network }}</span>
                </div>
                <div class="status ">{{ game.scoreboard.display }}</div>
              </div>
              <div class=" flex teams-wrapper">
                <div class="w-full">
                  <div class="team flex flex-row mb-2" v-for="team in [game.away, game.home]" v-bind:key="team.id">
                    <div class="w-2/3 flex flex-wrap">
                      <img :src="team.logo" class="w-8" /> <small v-if="team.rank">{{ team.rank }}&nbsp;</small>
                      <span class="name text-md pl-2">
                        <span class="hidden sm:inline-block">{{ team.name.short }}</span>
                        <span class="block sm:hidden">{{ team.name.abbr }}</span>
                      </span>
                    </div>
                    <div class="w-1/3 text-right">
                      <span class="score">{{ team.score }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
    </section>
  </layout-basic>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Header from './layouts/Header';
import LayoutBasic from '@/components/layouts/Basic';
export default Vue.extend({
  components: {
    Header,
    LayoutBasic,
  },
  data() {
    return {
      loading: false,
      gamesByLeague: null,
      error: null,
    };
  },
  mounted() {
    this.loadScoreboard();
  },
  methods: {
    refresh(e) {
      e.stopPropagation();
      e.preventDefault();
      this.loadScoreboard();
    },
    loadScoreboard() {
      this.loading = true;
      axios.get(`${process.env.NUXT_ENV_API_BASE}/games/scoreboard`).then(response => {
        console.log(response.data);
        this.games = response.data;
        this.loading = false;
        // const key = 'leagueName';
        this.gamesByLeague = response.data.reduce(function(rv, x) {
          (rv[x['leagueName']] = rv[x['leagueName']] || []).push(x);
          return rv;
        }, {});
        console.log('!!', this.gamesByLeague);
      });
    },
  },
});
</script>

<style lang="scss" scoped>
// @import '@/assets/vendor/wirecss/scss/wire.scss';
@import 'tailwindcss/base';

@import 'tailwindcss/components';

@import 'tailwindcss/utilities';

// .right {
//   float: right;
// }
// header.site-header {
//   margin-bottom: 40px;
// }

section.main {
  padding-top: 100px;
}

// img {
//   width: 30px;
// }
// .game-wrapper {
//   margin-bottom: 16px;
//   padding-right: 8px;
//   .game {
//     border: 2px solid lightgrey;
//     border-radius: 4px;
//     padding: 10px;
//     margin: 6px;
//     img {
//       width: 30px;
//       display: inline-block;
//     }
//     .status {
//       font-size: 15px;
//       text-align: right;
//     }
//   }
// }
// .game {
//   display: flex;
//   margin-right: 15px;
//   min-width: 200px;
//   max-width: 33%;
//   .column {
//     display: flex;
//     flex-direction: column;
//     flex-basis: 100%;
//     flex: 1;
//     .name {
//       line-height: 1.1;
//       margin-top: 10px;
//     }
//     .score {
//       font-size: 30px;
//     }
//     &.status,
//     &.team {
//       text-align: center;
//       font-size: 14px;
//     }
//   }
//   img {
//     width: 50px;
//     margin: 0 auto;
//   }
// }

// .status {
//   font-size: 12px;
//   float: right;
// }
// .wrapper {
//   display: inline-block;
//   margin-right: 32px;
//   min-width: 160px;
//   .inner {
//     border: 1px solid lightgrey;
//     border-radius: 4px;
//     padding: 2px 8px;
//     .score {
//       float: right;
//     }
//     .name {
//       padding-right: 16px;
//     }
//   }
// }
// .league {
//   display: block;
//   font-size: 12px;
//   text-transform: uppercase;
// }
// .league {
//   margin-bottom: 16px;
//   color: lightgrey;
//   text-transform: uppercase;
//   font-style: normal;
// }
.refresh-wrapper {
  display: block;
  height: 40px;
  .link {
    text-transform: capitalize;
    // border: 1px solid #0091e8;
    // padding: 4px 8px;
    // border-radius: 6px;
    color: #0091e8;
    text-transform: capitalize;
    // line-height: inherit;
    font-size: 14px;
  }
}
</style>
