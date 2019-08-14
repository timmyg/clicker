<template>
  <section>
    <header class="site-header-center">
      <page-header></page-header>
      <div id="title">Branding</div>
    </header>
    <section class="main container">
      <div>
        <h4>Logo Square</h4>
        <img src="https://clicker-brand.s3.amazonaws.com/logo-square.png" alt />
      </div>
      <div>
        <h4>Favicon</h4>
        <img src="https://clicker-brand.s3.amazonaws.com/favicon.ico" alt />
      </div>
    </section>
  </section>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus';
import PageHeader from './landing/PageHeader';
import * as moment from 'moment';

export default {
  data() {
    return {
      completed: false,
    };
  },

  components: { PageHeader },

  mounted: function() {},

  methods: {
    pay() {},
  },
};
</script> 

<style lang="scss">
.site-header-center {
  padding: 20px 0;
  .header-brand {
    margin: 0 auto;
  }
}
</style>

<style lang="scss" scoped>
.main {
  img {
    margin: 0;
    max-width: 300px;
  }
}
#title {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
}
</style> 