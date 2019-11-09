<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main container">
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
    this.loading = true;
      this.$http
        .get(`${process.env.NUXT_ENV_API_BASE}/games/scoreboard`)
        .then((games) => {
          console.log(games);
          console.log(games.body);
          console.log(games.body());
          this.loading = false;
          this.games = games;
        })
        .catch(e => {
          console.error(e);
          this.loading = false;
          this.error = true;
        });
  }
});
</script>

<style lang="scss" scoped>
.card {
  height: 100%;
}
.card-wrapper {
  padding: 20px 10px;
  .card {
    background: #eeeeee;

    header {
      text-align: center;
      padding-bottom: 20px;
    }
  }
}
header.site-header {
  margin-bottom: 40px;
}
img {
  max-width: 200px;
  max-height: 100px;
  margin: 0 auto;
}
section.main {
  padding-top: 100px;
}

.colors {
  .color {
    height: 80px;
    width: 80px;
    color: white;
    border-radius: 6px;
    text-align: center;
    display: inline-block;
    font-weight: bold;
  }
}
</style>