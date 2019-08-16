<template>
  <layout-basic>
    <Header v-bind:subtitle="'Brand'"></Header>
    <section class="container">
      <div class="row">
        <div v-bind:class="spacing">
          <div class="card">
            <header>Logo</header>
            <div>
              <img src="https://clicker-brand.s3.amazonaws.com/logo.png" alt="Clicker logo" />
            </div>
          </div>
        </div>
        <div v-bind:class="spacing">
          <div class="card">
            <header>Logo TV</header>
            <div>
              <img src="https://clicker-brand.s3.amazonaws.com/logo-tv.png" alt="Clicker tv logo" />
            </div>
          </div>
        </div>
        <div v-bind:class="spacing">
          <div class="card">
            <header>Logo TV Square 180</header>
            <div>
              <img
                src="https://clicker-brand.s3.amazonaws.com/logo-tv-square-180.png"
                alt="Clicker tv logo"
              />
            </div>
          </div>
        </div>
        <div v-bind:class="spacing">
          <div class="card">
            <header>Logo Square</header>
            <div>
              <img
                src="https://clicker-brand.s3.amazonaws.com/logo-square.png"
                alt="Clicker logo square"
              />
            </div>
          </div>
        </div>
        <div v-bind:class="spacing">
          <div class="card">
            <header>Favicon</header>
            <div>
              <img src="https://clicker-brand.s3.amazonaws.com/favicon.ico" alt="Clicker favicon" />
            </div>
          </div>
        </div>
        <div v-bind:class="spacing">
          <div class="card">
            <header>Checkerboard</header>
            <div>
              <img
                src="https://clicker-brand.s3.amazonaws.com/checkerboard.png"
                alt="Clicker checkerboard"
              />
            </div>
          </div>
        </div>
      </div>
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
  data() {
    return {
      spacing: 'col-12 col-6-md col-4-lg',
    };
  },
});
</script>

<style lang="scss" scoped>
@import '/css/chota.min.css';

.card {
  background: #eeeeee;
  padding-top: 20px;
  padding-bottom: 40px;
  header {
    text-align: center;
    padding-bottom: 20px;
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
</style>