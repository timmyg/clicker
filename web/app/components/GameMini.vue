<template>
  <div class="p-2">
    <div class="game-wrapper px-1">
      <div class="text-center text-xs">
        <div class="status">
          <span class="tag" v-if="isInPast()">Now Showing on {{getChannel()}}</span>
          <span class="tag" v-else>Autotuning to {{getChannel()}} in {{timeRemaining}}</span>
        </div>
      </div>
      <div class="flex teams-wrapper">
        <div class="w-full">
          <div class="team flex flex-row mb-2">
            <template v-if="!!game.away">
              <div
                v-for="team in getTeams()"
                class="w-1/2 flex flex-wrap justify-center"
                v-bind:key="team.id"
              >
                <div class="flex justify-center">
                  <img :src="team.logo" class="logo" />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="w-full flex flex-wrap justify-center">
                <div class="flex justify-center">
                  <img :src="game.img" class="logo" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as moment from "moment";

export default {
  props: ["game"],
  created() {
    const interval = setInterval(() => this.calculateTimeUntil(), 1000);
  },
  data() {
    return {
      timeRemaining: null
    };
  },
  methods: {
    getChannel() {
      return this.game.broadcast.network;
    },
    isInPast() {
      return moment().diff(moment(this.game.start)) > 0;
    },
    calculateTimeUntil() {
      console.log(this.game);
      let seconds = Math.floor(
        moment.duration(moment(this.game.start).diff(moment())).asSeconds()
      );
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      let days = Math.floor(hours / 24);

      hours = hours - days * 24;
      minutes = minutes - days * 24 * 60 - hours * 60;
      seconds = Math.floor(
        seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60
      );
      this.timeRemaining = `${hours
        .toString()
        .padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    getTeams() {
      return [this.game.away, this.game.home];
    }
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
img.logo {
  height: 40px;
}
.game-wrapper {
  border: 2px solid lightgrey;
  border-radius: 6px;
  background: white;
}
</style>
