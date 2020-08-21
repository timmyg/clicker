<template>
  <div class="p-2">
    <div class="game-wrapper px-1">
      <div class="flex flex-row status-wrapper justify-between text-sm">
        <div class="status">
          <span class="tag" v-if="isPast">Now Showing on {{getChannel()}}</span>
          <span class="tag" v-else>Autotuning to {{getChannel()}} in 3 minutes...</span>
        </div>
      </div>
      <div class="flex teams-wrapper">
        <div class="w-full">
          <div class="team flex flex-row mb-2">
            <div
              v-for="team in getTeams()"
              class="w-1/2 flex flex-wrap justify-center"
              v-bind:key="team.id"
            >
              <div class="flex justify-center">
                <img :src="team.logo" class="logo" />
                <!-- <div class="name text-md pl-2 relative text-sm">
                  <span v-if="team.rank" class="text-gray-500 text-xs">
                    {{
                    team.rank
                    }}
                  </span>
                  <span class="hidden sm:inline-block">
                    {{
                    team.name.short | truncate(15)
                    }}
                  </span>
                  <span class="inline-block sm:hidden text-sm">
                    {{
                    team.name.abbr | truncate(5)
                    }}
                  </span>
                </div>-->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as moment from "moment";

export default Vue.extend({
  props: ["game"],
  // data() {
  //   return {
  //     // isVegas: false
  //   };
  // },
  methods: {
    getChannel() {
      return this.game.broadcast.network;
    },
    isPast() {
      return moment().diff(moment(this.game.start)) > 0;
    },
    getTimeUntil() {
      console.log(this.game);
      // let seconds = moment
      //   .duration(moment(this.game.start).diff(moment()))
      //   .asSeconds();
      // let minutes = Math.floor(seconds / 60);
      // let hours = Math.floor(minutes / 60);
      // let days = Math.floor(hours / 24);

      // hours = hours - days * 24;
      // minutes = minutes - days * 24 * 60 - hours * 60;
      // seconds = Math.floor(
      //   seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60
      // );
      // // return `${hours}h ${minutes}m ${seconds}s`;
      // return moment(this.game.start).format("M/D h:mma");
      console.log(moment().diff(moment(this.game.start)));
      const isPast = moment().diff(moment(this.game.start)) > 0;
      if (isPast) {
        return "past";
      } else {
        return "future";
      }
    },
    getTeams() {
      return [this.game.away, this.game.home];
    },
    getTimeFormatted() {
      if (this.game.scoreboard) {
        return this.game.scoreboard.display;
      } else if (moment().diff(this.game.start) >= 0) {
        return moment(this.game.start).format("h:mma");
      } else {
        return moment(this.game.start).format("M/D h:mma");
      }
    },
    getSpread(team) {
      return team.book.spread > 0 ? `+${team.book.spread}` : team.book.spread;
    },
    getMoneyline(team) {
      return team.book.moneyline > 0
        ? `+${team.book.moneyline}`
        : team.book.moneyline;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
img.logo {
  height: 20px;
}
.game-wrapper {
  border: 2px solid lightgrey;
  border-radius: 6px;
  background: white;
}
</style>
