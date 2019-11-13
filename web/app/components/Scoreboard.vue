<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main container">
      <a href class="right" v-if="!loading" v-on:click="refresh($event)">refresh</a>
      <span class="right" v-else>refreshing...</span>
      <!-- <table class="table table-bordered">
        <thead>
          <tr>
            <th>Game</th>
            <th>Status</th>
          </tr>
      </thead>-->
      <div v-for="game in games" v-bind:key="game.id">
        <span>{{game.statusDisplay}}</span>
        <br />
        <span>{{game.awayTeam}} <b>{{game.boxscore.totalAwayPoints}}<b/></span>
        <br />
        <span>{{game.homeTeam}} <b>{{game.boxscore.totalHomePoints}}</b></span>
      </div>
      <br /><br />
      <!-- </table> -->
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
      games: null,
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
      // this.$http
      //   .get(`${process.env.NUXT_ENV_API_BASE}/games/scoreboard`)
      //   .then(response => {
      //     this.games = response.json()
      //     console.log(response.clone().json());
      //     console.log(response.json());
      //     // console.log(response.data.json());
      //     console.log(response.body);
      //     console.log(response.data);
      //     // console.log(response.body.json());
      //     // // console.log(response.text());
      //     this.loading = false;
      //   })
      //   .catch(e => {
      //     console.error(e);
      //     this.loading = false;
      //     this.error = true;
      //   });
      axios.get(`${process.env.NUXT_ENV_API_BASE}/games/scoreboard`).then(response => {
        console.log(response.data);
        this.games = response.data;
        this.loading = false;
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
</style>