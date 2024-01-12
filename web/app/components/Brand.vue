<template>
  <layout-basic>
    <Header v-bind:subtitle="'Brand'"></Header>
    <section class="main container">
      <div class="row">
        <div class="card-wrapper" v-bind:class="spacing">
          <div class="card">
            <header>Colors</header>
            <div class="colors">
              <div
                class="color"
                id="primary"
                v-bind:style="{ background: colors.primary }"
              >{{ colors.primary }}</div>
              <div
                class="color"
                id="secondary"
                v-bind:style="{ background: colors.secondary }"
              >{{ colors.secondary }}</div>
            </div>
          </div>
        </div>
        <div class="card-wrapper" v-bind:class="spacing">
          <div class="card">
            <header>Logo</header>
            <div>
              <img src="/logo.png" alt="Clicker logo" />
            </div>
          </div>
        </div>
        <div class="card-wrapper" v-bind:class="spacing">
          <div class="card">
            <header>Logo (monochrome)</header>
            <div>
              <img
                src="https://clicker-brand.s3.amazonaws.com/logo-monochrome.png"
                alt="Clicker logo monochrome"
              />
            </div>
          </div>
        </div>
        <div class="card-wrapper" v-bind:class="spacing">
          <div class="card">
            <header>Logo TV</header>
            <div>
              <img src="https://clicker-brand.s3.amazonaws.com/logo-tv.png" alt="Clicker tv logo" />
            </div>
          </div>
        </div>
        <div class="card-wrapper" v-bind:class="spacing">
          <div class="card">
            <header>Logo TV Square</header>
            <div>
              <img
                src="https://clicker-brand.s3.amazonaws.com/logo-tv-square-180.png"
                alt="Clicker tv logo"
              />
            </div>
          </div>
        </div>
        <div class="card-wrapper" v-bind:class="spacing">
          <div class="card">
            <header>Logo Square w/ bg</header>
            <div>
              <img
                src="https://clicker-brand.s3.amazonaws.com/logo-square.png"
                alt="Clicker logo square"
              />
            </div>
          </div>
        </div>
        <div class="card-wrapper" v-bind:class="spacing">
          <div class="card">
            <header>Favicon</header>
            <div>
              <img src="https://clicker-brand.s3.amazonaws.com/favicon.ico" alt="Clicker favicon" />
            </div>
          </div>
        </div>
        <div class="card-wrapper" v-bind:class="spacing">
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
import Vue from "vue";
import Header from "./layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
export default Vue.extend({
  components: {
    Header,
    LayoutBasic
  },
  data() {
    return {
      spacing: "col-12 col-6-md col-4-lg",
      colors: {
        primary: "#0091ea",
        secondary: "#55C3F5"
      }
    };
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
