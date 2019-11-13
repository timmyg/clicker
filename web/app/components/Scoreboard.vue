<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main container">
      <div class="refresh-wrapper">
        <a href class="link right" v-if="!loading" v-on:click="refresh($event)">refresh</a>
        <a class="link right" v-else disabled>refreshing...</a>
      </div>
      <div
        v-for="(games, leagueName) in gamesByLeague"
        v-bind:key="leagueName"
        class="league-wrapper"
      >
        <div class="league">
          <em>{{leagueName}}</em>
        </div>
        <div v-for="game in games" v-bind:key="game.id" class="wrapper">
          <span class="status">{{game.statusDisplay}}</span>
          <br />
          <span>
            {{game.awayTeam}}
            <b>{{game.boxscore.totalAwayPoints}}</b>
          </span>
          <br />
          <span>
            {{game.homeTeam}}
            <b>{{game.boxscore.totalHomePoints}}</b>
          </span>
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
.right {
  float: right;
}
header.site-header {
  margin-bottom: 40px;
}

section.main {
  padding-top: 100px;
}
.status {
  font-size: 12px;
}
.wrapper {
  display: inline-block;
  margin-right: 32px;
  border: 1px solid lightgrey;
  border-radius: 10px;
  padding: 2px 8px;
  min-width: 160px;
}
.league {
  display: block;
  font-size: 12px;
}
.league-wrapper {
  margin-bottom: 16px;
}
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