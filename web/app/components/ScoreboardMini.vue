<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main container">
      <div class="refresh-wrapper text-right">
        <span>
          <a href class="link" v-if="!loading" v-on:click="refresh($event)"
            >refresh</a
          >
          <a class="link" v-else disabled>refreshing...</a>
        </span>
      </div>
      <div
        v-for="(games, leagueName) in gamesByLeague"
        v-bind:key="leagueName"
        class="league-wrapper"
      >
        <div class="league uppercase text-sm font-bold">{{ leagueName }}</div>
        <div class="flex flex-wrap mb-4">
          <div
            v-for="game in games"
            v-bind:key="game.id"
            class="game w-1/2 lg:w-1/4 mb-4"
          >
            <Game v-bind:game="game" />
          </div>
        </div>
      </div>
      <br />
      <br />
    </section>
  </layout-basic>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import Game from "./Game";
import Header from "./layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
export default Vue.extend({
  components: {
    Game,
    Header,
    LayoutBasic
  },
  data() {
    return {
      loading: false,
      gamesByLeague: null,
      error: null
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
      axios
        .get(`${process.env.NUXT_ENV_API_BASE}/games/scoreboard/upcoming`)
        .then(response => {
          this.games = response.data;
          this.loading = false;
          // const key = 'leagueName';
          this.gamesByLeague = response.data.reduce(function(rv, x) {
            (rv[x["leagueName"]] = rv[x["leagueName"]] || []).push(x);
            return rv;
          }, {});
        });
    }
  }
});
</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

section.main {
  padding-top: 100px;
}
</style>
