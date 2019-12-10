<template>
  <div class="p-2" v-on:click="toggleVegas()">
    <div class="game-wrapper px-1">
      <div class="flex flex-row status-wrapper justify-between text-sm">
        <div>
          <span v-if="game.broadcast">{{ game.broadcast.network | truncate(5) }}</span>
        </div>
        <div class="status">
          <span v-if="isVegas && !!game.book">+/- {{ game.book.total }}</span>
          <span v-else>{{ getTimeFormatted() }}</span>
        </div>
      </div>
      <div class="flex teams-wrapper">
        <div class="w-full">
          <div class="team flex flex-row mb-2" v-for="team in getTeams()" v-bind:key="team.id">
            <div class="w-1/2 flex flex-wrap items-center">
              <img :src="team.logo" class="logo" />
              <div class="name text-md pl-2 relative text-sm">
                <span v-if="team.rank" class="text-gray-500 text-xs">{{ team.rank }}</span>
                <span class="hidden sm:inline-block">{{ team.name.short | truncate(15) }}</span>
                <span class="inline-block sm:hidden text-sm">{{ team.name.abbr | truncate(5) }}</span>
              </div>
            </div>
            <div class="w-1/2">
              <span v-if="isVegas" class="text-sm flex">
                <span v-if="!team.book">-</span>
                <span v-else>
                  <span class="w-1/2">{{getSpread(team)}}</span>
                  <span class="w-1/2">{{getMoneyline(team)}}</span>
                </span>
              </span>
              <span class="float-right score" v-else>{{ team.score }}</span>
              <!-- <span class="float-right score">64</span> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as moment from 'moment';

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
    getTimeFormatted() {
      if (this.game.scoreboard) {
        return this.game.scoreboard.display;
      } else if (moment().diff(this.game.start) >= 0) {
        return moment(this.game.start).format('h:mma');
      } else {
        return moment(this.game.start).format('M/D h:mma');
      }
    },
    getSpread(team) {
      console.log({ team });
      return team.book.spread > 0 ? `+${team.book.spread}` : team.book.spread;
    },
    getMoneyline(team) {
      return team.book.moneyline > 0 ? `+${team.book.moneyline}` : team.book.moneyline;
    },
  },
});
</script>

<style lang="scss" scoped>
// .rank {
//   top: -13px;
//   left: 0;
// }
img.logo {
  height: 20px;
}
</style>
