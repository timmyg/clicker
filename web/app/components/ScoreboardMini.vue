<template>
  <div class="flex flex-wrap mb-4 justify-center">
    <div v-for="game in games" v-bind:key="game.id" class="game w-1/2 lg:w-1/6 mb-4">
      <GameMini v-bind:game="game" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import GameMini from "./GameMini";

export default Vue.extend({
  components: {
    GameMini
  },
  data() {
    return {
      loading: false,
      error: null,
      games: null
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
        });
    }
  }
});
</script>

<style lang="scss" scoped>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
