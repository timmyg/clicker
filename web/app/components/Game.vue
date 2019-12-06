<template>
  <div class="p-2" v-on:click="toggleVegas()">
    <div class="game-wrapper rounded-sm border border-gray-300 px-4">
      <div class="flex flex-row status-wrapper justify-between text-sm">
        <div>
          <span v-if="game.broadcast">{{ game.broadcast.network }}</span>
        </div>
        <div
          class="status"
        >{{ game.scoreboard ? game.scoreboard.display : game.start | moment('h:mma') }}</div>
      </div>
      <div class="flex teams-wrapper">
        <div class="w-full" v-if="!isVegas">
          <div class="team flex flex-row mb-2" v-for="team in getTeams()" v-bind:key="team.id">
            <div class="w-2/3 flex flex-wrap">
              <img :src="team.logo" class="w-8" />
              <div class="name text-md pl-2 relative">
                <span v-if="team.rank" class="rank absolute text-xs">{{ team.rank }}</span>
                <span class="hidden sm:inline-block">{{ team.name.short }}</span>
                <span class="block sm:hidden">{{ team.name.abbr }}</span>
              </div>
            </div>
            <div class="w-1/3 text-right">
              <span class="score">{{ team.score }}</span>
            </div>
          </div>
        </div>
        <div class="w-full text-center" v-else>
          <div class="flex flex-row font-bold">
            <div class="w-1/3">O/U</div>
            <div class="w-1/3">Spread</div>
            <div class="w-1/3">ML</div>
          </div>
          <div class="flex flex-row text-sm">
            <div class="w-1/3">{{game.book.total}}</div>
            <div class="w-1/3">{{game.home.name.abbr}} {{game.home.book.spread}}</div>
            <div class="w-1/3">
              {{game.home.name.abbr}}
              <template
                v-if="!!game.home.book.moneyline"
              >+{{game.home.book.moneyline}}</template>
              <template v-else>{{game.home.book.moneyline}}</template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: ['game'],
  data() {
    return {
      isVegas: false,
    };
  },
  methods: {
    toggleVegas() {
      this.isVegas = !this.isVegas;
    },
    getTeams() {
      return [this.game.away, this.game.home];
    },
  },
});
</script>

<style lang="scss" scoped>
.rank {
  top: -13px;
  left: 0;
}
</style>
