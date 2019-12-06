<template>
  <div class="game-wrapper p-2">
    <div class="flex flex-row status-wrapper justify-between text-sm">
      <div>
        <span v-if="game.broadcast">{{ game.broadcast.network }}</span>
      </div>
      <div class="status">{{ game.scoreboard ? game.scoreboard.display : game.start | moment('h:mma') }}</div>
    </div>
    <div class=" flex teams-wrapper">
      <div class="w-full">
        <div class="team flex flex-row mb-2" v-for="team in getTeams()" v-bind:key="team.id">
          <div class="w-2/3 flex flex-wrap">
            <img :src="team.logo" class="w-8" />
            <div class="name text-md pl-2 relative">
              <span v-if="team.rank" class="rank absolute text-sm">{{ team.rank }}</span>
              <span class="hidden sm:inline-block">{{ team.name.short }}</span>
              <span class="block sm:hidden">{{ team.name.abbr }}</span>
            </div>
          </div>
          <div class="w-1/3 text-right">
            <span class="score">{{ team.score }}</span>
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
  methods: {
    getTeams() {
      return [this.game.away, this.game.home];
    },
  },
});
</script>

<style lang="scss" scoped>
.rank {
  top: -20px;
  left: 0;
}
</style>
