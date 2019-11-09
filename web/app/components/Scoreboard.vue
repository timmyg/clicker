<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main container">
      <span class="right" v-if="!loading" v-on:click="refresh()">refresh</span>
    	<table class="table table-bordered">
        <thead>
          <tr>
            <th> Game </th>
            <th> Status</th>
          </tr>
        </thead>
        <tr v-for="game in games" v-bind:key="game.id">
          <td>{{game.awayTeam}} @ {{game.homeTeam}}</td>
          <td>{{game.status}}</td>
        </tr>
      </table>
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
  data () {
    return {
      loading: false,
      games: null,
      error: null
    }
  },
  mounted () {
    this.loadScoreboard()
  },
  methods: {
    refresh(value) {
      this.loadScoreboard()
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
          axios
      .get(`${process.env.NUXT_ENV_API_BASE}/games/scoreboard`)
      .then(response => {
        console.log(response.data)
        this.games = response.data
      })
    }
  }
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