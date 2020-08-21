<template>
  <div class="container">
    <div class="flex flex-wrap mb-4 justify-center">
      <div
        v-for="game in games"
        v-bind:key="game.id"
        class="game w-1/2 lg:w-1/3 mb-4"
      >
        <GameMini v-bind:game="game" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import GameMini from "./GameMini";
import * as moment from "moment";

export default {
  components: {
    GameMini
  },
  data() {
    return {
      loading: false,
      error: null,
      games: null,
      gamesRaw: null
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
          const gamesResponse = response.data;
          const sportscenter = {
            start: moment()
              .add(20, "s")
              .toDate(),
            broadcast: { network: "ESPN" },
            img: "https://clicker-demo.s3.amazonaws.com/sportscenter.png"
          };
          gamesResponse.splice(0, 0, sportscenter);
          this.games = gamesResponse;
          console.log(this.games);
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
